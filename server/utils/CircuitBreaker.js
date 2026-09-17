import logger from './logger.js';

export const CircuitState = Object.freeze({
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
});

export class CircuitBreaker {
  /**
   * @param {Object} options
   * @param {string} options.name - Service or operation identifier
   * @param {number} options.failureThreshold - Consecutive failures before opening circuit (default: 3)
   * @param {number} options.recoveryTimeout - Time in ms before attempting recovery probe (default: 30000ms)
   * @param {number} options.requestTimeout - Individual request timeout in ms (default: 8000ms)
   */
  constructor(options = {}) {
    this.name = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeout = options.recoveryTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 8000;

    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.successfulProbes = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
    this.stats = {
      totalExecutions: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      totalFallbacks: 0,
      totalShortCircuited: 0,
    };
  }

  /**
   * Current circuit state
   */
  getState() {
    // If circuit is OPEN and recovery timeout has elapsed, transition to HALF_OPEN
    if (this.state === CircuitState.OPEN && Date.now() >= this.nextAttempt) {
      this.state = CircuitState.HALF_OPEN;
      logger.warn(`[CircuitBreaker:${this.name}] Transitioned from OPEN to HALF_OPEN (probing external service)`);
    }
    return this.state;
  }

  /**
   * Execute an asynchronous action with timeout protection and circuit breaker logic
   *
   * @param {Function} action - Async function returning a promise
   * @param {Function} [fallback] - Optional fallback function to execute when circuit is open or action fails
   */
  async fire(action, fallback = null) {
    this.stats.totalExecutions++;
    const currentState = this.getState();

    // 1. If Circuit is OPEN, fail fast and execute fallback immediately
    if (currentState === CircuitState.OPEN) {
      this.stats.totalShortCircuited++;
      logger.warn(
        `[CircuitBreaker:${this.name}] Circuit is OPEN. Short-circuiting call without hitting external service.`
      );
      if (typeof fallback === 'function') {
        this.stats.totalFallbacks++;
        return await fallback(new Error(`CircuitBreaker '${this.name}' is OPEN`));
      }
      const error = new Error(`Service '${this.name}' is currently unavailable (CircuitBreaker OPEN)`);
      error.isCircuitBreakerOpen = true;
      throw error;
    }

    // 2. Execute action with timeout
    try {
      const result = await this._executeWithTimeout(action);
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);

      // 3. Trigger fallback if provided
      if (typeof fallback === 'function') {
        this.stats.totalFallbacks++;
        logger.info(`[CircuitBreaker:${this.name}] Invoking fallback handler following failure: ${error.message}`);
        return await fallback(error);
      }

      throw error;
    }
  }

  /**
   * Wrap action with strict execution timeout
   */
  _executeWithTimeout(action) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.requestTimeout}ms`));
      }, this.requestTimeout);

      Promise.resolve(action())
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Handle successful execution
   */
  _onSuccess() {
    this.stats.totalSuccesses++;
    if (this.state === CircuitState.HALF_OPEN) {
      logger.info(`[CircuitBreaker:${this.name}] Canary probe succeeded! Closing circuit.`);
      this.state = CircuitState.CLOSED;
      this.consecutiveFailures = 0;
    } else {
      this.consecutiveFailures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  _onFailure(error) {
    this.stats.totalFailures++;
    this.consecutiveFailures++;
    this.lastFailureTime = new Date();

    logger.error(
      `[CircuitBreaker:${this.name}] Failure recorded (${this.consecutiveFailures}/${this.failureThreshold}): ${error.message}`
    );

    if (this.state === CircuitState.HALF_OPEN || this.consecutiveFailures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      logger.warn(
        `[CircuitBreaker:${this.name}] Circuit tripped to OPEN! Fast-failing for ${this.recoveryTimeout / 1000}s until ${new Date(this.nextAttempt).toISOString()}`
      );
    }
  }

  /**
   * Diagnostic statistics
   */
  getDiagnostics() {
    return {
      name: this.name,
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: new Date(this.nextAttempt).toISOString(),
      stats: { ...this.stats },
    };
  }
}

export default CircuitBreaker;
