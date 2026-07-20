import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiSearch } from 'react-icons/fi';
import {
  useGetAllMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
} from '../../features/member/memberApi';
import { useAppSelector } from '../../app/hooks';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROLE_LABELS, MEMBERSHIP_STATUS_LABELS, ALL_ROLES } from '../../utils/roles';

const STATUS_FILTERS = ['', 'pending', 'active', 'suspended', 'rejected', 'inactive'];

const MembersManagementPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data, isLoading } = useGetAllMembersQuery({
    search: search || undefined,
    membershipStatus: statusFilter || undefined,
    limit: 50,
  });

  const [approveMember, { isLoading: isApproving }] = useApproveMemberMutation();
  const [rejectMember] = useRejectMemberMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [updateStatus] = useUpdateMemberStatusMutation();

  const members = data?.data?.members || [];
  const canManageRoles = ['owner', 'super_admin'].includes(currentUser?.role);

  const handleApprove = async (id) => {
    try {
      await approveMember(id).unwrap();
      toast.success('সদস্যপদ অনুমোদন করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'অনুমোদন ব্যর্থ হয়েছে');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMember({ id }).unwrap();
      toast.success('আবেদন বাতিল করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'বাতিল করা ব্যর্থ হয়েছে');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateRole({ id, role }).unwrap();
      toast.success('রোল পরিবর্তন করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'রোল পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success('স্ট্যাটাস পরিবর্তন করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-5">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">সদস্য ব্যবস্থাপনা</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল বা সদস্য আইডি দিয়ে খুঁজুন"
            className="input-field pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-52">
          <option value="">সব স্ট্যাটাস</option>
          {STATUS_FILTERS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {MEMBERSHIP_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-medium">সদস্য</th>
                <th className="p-4 font-medium">রোল</th>
                <th className="p-4 font-medium">স্ট্যাটাস</th>
                <th className="p-4 font-medium text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="p-4">
                    <p className="font-medium text-slate-700 dark:text-slate-200">{m.fullName}</p>
                    <p className="text-xs text-slate-400">{m.email} · {m.memberId || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    {canManageRoles ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m._id, e.target.value)}
                        className="input-field !py-1.5 text-xs"
                        disabled={m.role === 'owner'}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs">{ROLE_LABELS[m.role]}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={m.membershipStatus}
                      onChange={(e) => handleStatusChange(m._id, e.target.value)}
                      className="input-field !py-1.5 text-xs"
                      disabled={m.role === 'owner' || m.membershipStatus === 'pending'}
                    >
                      {['active', 'suspended', 'inactive'].map((s) => (
                        <option key={s} value={s}>
                          {MEMBERSHIP_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    {m.membershipStatus === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          className="!py-1.5 !px-3 text-xs"
                          isLoading={isApproving}
                          onClick={() => handleApprove(m._id)}
                        >
                          <FiCheck size={13} /> অনুমোদন
                        </Button>
                        <Button
                          variant="ghost"
                          className="!py-1.5 !px-3 text-xs text-danger border-danger/30"
                          onClick={() => handleReject(m._id)}
                        >
                          <FiX size={13} /> বাতিল
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && <p className="text-center text-slate-400 py-10">কোনো সদস্য পাওয়া যায়নি</p>}
        </div>
      )}
    </div>
  );
};

export default MembersManagementPage;
