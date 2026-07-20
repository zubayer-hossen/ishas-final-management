import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import {
  useGetCommitteesQuery,
  useCreateCommitteeMutation,
  useAddCommitteeMemberMutation,
  useRemoveCommitteeMemberMutation,
  useDeleteCommitteeMutation,
} from '../../features/committee/committeeApi';
import { useGetAllMembersQuery } from '../../features/member/memberApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const POSITION_LABELS = {
  president: 'সভাপতি',
  vice_president: 'সহ-সভাপতি',
  general_secretary: 'সাধারণ সম্পাদক',
  joint_secretary: 'যুগ্ম সম্পাদক',
  treasurer: 'কোষাধ্যক্ষ',
  organizing_secretary: 'সাংগঠনিক সম্পাদক',
  office_secretary: 'অফিস সম্পাদক',
  publicity_secretary: 'প্রচার সম্পাদক',
  executive_member: 'কার্যনির্বাহী সদস্য',
};

const CreateCommitteeForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [createCommittee, { isLoading }] = useCreateCommitteeMutation();

  const onSubmit = async (formData) => {
    try {
      await createCommittee(formData).unwrap();
      toast.success('কমিটি তৈরি হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'কমিটি তৈরি ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">নতুন কমিটি তৈরি করুন</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>
        <TextInput
          label="কমিটির নাম"
          error={errors.name?.message}
          {...register('name', { required: 'নাম আবশ্যক' })}
        />
        <TextInput
          label="মেয়াদকাল (যেমন: ২০২৫-২০২৭)"
          error={errors.termYear?.message}
          {...register('termYear', { required: 'মেয়াদকাল আবশ্যক' })}
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          তৈরি করুন
        </Button>
      </form>
    </div>
  );
};

const AddMemberForm = ({ committeeId, onClose }) => {
  const { data: membersData } = useGetAllMembersQuery({ membershipStatus: 'active', limit: 200 });
  const [addMember, { isLoading }] = useAddCommitteeMemberMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const members = membersData?.data?.members || [];

  const onSubmit = async (formData) => {
    try {
      await addMember({ id: committeeId, ...formData }).unwrap();
      toast.success('সদস্য যুক্ত করা হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'সদস্য যুক্ত করা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">কমিটিতে সদস্য যুক্ত করুন</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <div>
          <label className="field-label">সদস্য</label>
          <select className="input-field" {...register('userId', { required: true })}>
            <option value="">নির্বাচন করুন</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName} ({m.memberId})
              </option>
            ))}
          </select>
          {errors.userId && <p className="field-error">সদস্য নির্বাচন করুন</p>}
        </div>

        <div>
          <label className="field-label">পদ</label>
          <select className="input-field" {...register('position', { required: true })}>
            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          যুক্ত করুন
        </Button>
      </form>
    </div>
  );
};

const CommitteesPage = () => {
  const { data, isLoading } = useGetCommitteesQuery({ limit: 20 });
  const [deleteCommittee] = useDeleteCommitteeMutation();
  const [removeMember] = useRemoveCommitteeMemberMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [addMemberTo, setAddMemberTo] = useState(null);

  const committees = data?.data?.committees || [];

  const handleDelete = async (id) => {
    try {
      await deleteCommittee(id).unwrap();
      toast.success('কমিটি মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  const handleRemoveMember = async (committeeId, memberEntryId) => {
    try {
      await removeMember({ id: committeeId, memberEntryId }).unwrap();
      toast.success('সদস্য সরানো হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'সরানো ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">কমিটি ব্যবস্থাপনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setShowCreate(true)}>
          <FiPlus size={15} /> নতুন কমিটি
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {committees.map((committee) => (
            <div key={committee._id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{committee.name}</p>
                  <p className="text-xs text-slate-400">মেয়াদ: {committee.termYear}</p>
                </div>
                <button onClick={() => handleDelete(committee._id)} className="text-danger/70 hover:text-danger">
                  <FiTrash2 size={15} />
                </button>
              </div>

              <ul className="space-y-2 mb-3">
                {committee.members.map((m) => (
                  <li key={m._id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      {m.user?.fullName} <span className="text-xs text-slate-400">— {POSITION_LABELS[m.position]}</span>
                    </span>
                    <button
                      onClick={() => handleRemoveMember(committee._id, m._id)}
                      className="text-slate-400 hover:text-danger"
                    >
                      <FiX size={14} />
                    </button>
                  </li>
                ))}
                {committee.members.length === 0 && (
                  <p className="text-xs text-slate-400">কোনো সদস্য যুক্ত করা হয়নি</p>
                )}
              </ul>

              <button
                onClick={() => setAddMemberTo(committee._id)}
                className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                + সদস্য যুক্ত করুন
              </button>
            </div>
          ))}

          {committees.length === 0 && (
            <div className="glass-card p-10 text-center text-slate-400 lg:col-span-2">কোনো কমিটি তৈরি করা হয়নি</div>
          )}
        </div>
      )}

      {showCreate && <CreateCommitteeForm onClose={() => setShowCreate(false)} />}
      {addMemberTo && <AddMemberForm committeeId={addMemberTo} onClose={() => setAddMemberTo(null)} />}
    </div>
  );
};

export default CommitteesPage;
