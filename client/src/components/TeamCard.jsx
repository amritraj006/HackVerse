import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
  Users,
  Crown,
  UserMinus,
  LogOut,
  Trash2,
  UserPlus,
  Copy,
  Check,
  ArrowRightLeft,
} from 'lucide-react';

export const TeamCard = ({
  team,
  currentUserId,
  onInvite,
  onRemoveMember,
  onTransferLeadership,
  onLeave,
  onDelete,
  readOnly = false,
}) => {
  const [copied, setCopied] = useState(false);

  const { _id, name, hackathon, leader, members = [], joinCode } = team;

  const leaderId = typeof leader === 'object' ? leader?._id : leader;
  const isLeader = currentUserId && leaderId === currentUserId;
  const isMember = currentUserId && members.some((m) => (typeof m === 'object' ? m._id : m) === currentUserId);
  const maxTeamSize = hackathon?.maxTeamSize || 4;

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{name}</h3>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shrink-0">
            {members.length}/{maxTeamSize} Members
          </span>
        </div>

        {hackathon && (
          <p className="text-xs text-slate-500 line-clamp-1">
            Hackathon: <span className="font-semibold text-slate-700">{hackathon.title}</span>
          </p>
        )}

        {/* Join Code block (for leader & members) */}
        {!readOnly && (isLeader || isMember) && joinCode && (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-md p-2 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              Join Code: <strong className="text-slate-800 tracking-wider select-all">{joinCode}</strong>
            </span>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              title="Copy Join Code"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Member List */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Team Members</h4>
        <div className="space-y-1.5">
          {members.map((member) => {
            const mId = typeof member === 'object' ? member._id : member;
            const mName = typeof member === 'object' ? member.name : 'Member';
            const mEmail = typeof member === 'object' ? member.email : '';
            const isMemLeader = mId === leaderId;

            return (
              <div
                key={mId}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {mName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate flex items-center gap-1">
                      {mName}
                      {isMemLeader && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                          <Crown className="w-2.5 h-2.5" /> Leader
                        </span>
                      )}
                    </p>
                    {mEmail && <p className="text-[10px] text-slate-400 truncate">{mEmail}</p>}
                  </div>
                </div>

                {/* Leader Actions on individual members */}
                {!readOnly && isLeader && !isMemLeader && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTransferLeadership && onTransferLeadership(_id, mId, mName)}
                      className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                      title="Transfer Leadership"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveMember && onRemoveMember(_id, mId, mName)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer Action Bar */}
      {!readOnly && (isLeader || isMember) && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {isLeader ? (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {members.length < maxTeamSize && (
                <Button size="sm" variant="outline" onClick={() => onInvite && onInvite(team)}>
                  <UserPlus className="w-3.5 h-3.5" /> Invite
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => onDelete && onDelete(_id, name)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Team
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => onLeave && onLeave(_id, name)}
            >
              <LogOut className="w-3.5 h-3.5" /> Leave Team
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
