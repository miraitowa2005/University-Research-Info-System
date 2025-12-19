
import React from 'react';
import { ResearchItem, User, ResearchSubtype } from '../types';
import { RESEARCH_SUBTYPES } from '../logic/compiler';
import { CheckCircle, XCircle, Eye, Trash2, Edit, Send, Download, Shield } from 'lucide-react';

interface Props {
  data: ResearchItem[];
  currentUser: User;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onViewDetail?: (item: ResearchItem) => void;
  onExport?: () => void;
}

/**
 * Reusable helper to determine masking status and sensitive fields
 * Iterates through subtypes to identify fields marked with isSensitive
 */
export const getResearchMaskingStatus = (
  item: ResearchItem, 
  user: User, 
  subtypes: ResearchSubtype[]
) => {
  // 1. Check Access Permissions (Admin, Owner, Team Member)
  // These roles see everything unmasked
  const isPrivileged = user.role === 'sys_admin' || user.role === 'research_admin';
  const isOwner = item.authorId === user.id;
  const isTeamMember = item.teamMembers?.includes(user.name) ?? false;

  if (isPrivileged || isOwner || isTeamMember) {
    return { isMasked: false, maskedFields: [] as string[] };
  }

  // 2. Identify Sensitive Fields from Configuration
  // We filter subtypes matching the item's category, then check every field for the isSensitive flag.
  const sensitiveFields = subtypes
    .filter(subtype => subtype.category === item.category)
    .reduce((acc, subtype) => {
      const sensitiveKeys = subtype.fields
        .filter(field => field.isSensitive === true)
        .map(field => field.key);
      return [...acc, ...sensitiveKeys];
    }, [] as string[]);

  // De-duplicate fields in case multiple subtypes share the same key
  const uniqueSensitiveFields = Array.from(new Set(sensitiveFields));

  return { isMasked: true, maskedFields: uniqueSensitiveFields };
};

export const ResearchTable: React.FC<Props> = ({ 
  data, currentUser, selectedIds = [], onSelect, onSelectAll,
  onApprove, onReject, onDelete, onSubmit, onViewDetail, onExport 
}) => {
  
  const getStatusConfig = (status: string) => {
    const baseClass = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors";
    const dotClass = "w-1.5 h-1.5 rounded-full mr-1.5";
    const s = (status || '').toLowerCase();
    
    switch (s) {
      case 'approved': 
        return { 
          component: <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-100`}><span className={`${dotClass} bg-emerald-500`}></span>已通过</span> 
        };
      case 'rejected': 
        return { 
          component: <span className={`${baseClass} bg-red-50 text-red-700 border-red-100`}><span className={`${dotClass} bg-red-500`}></span>已驳回</span> 
        };
      case 'pending': 
        return { 
          component: <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-100`}><span className={`${dotClass} bg-amber-500 animate-pulse`}></span>审核中</span> 
        };
      case 'draft': 
        return { 
          component: <span className={`${baseClass} bg-slate-50 text-slate-600 border-slate-200`}><span className={`${dotClass} bg-slate-400`}></span>草稿</span> 
        };
      default: 
        return { 
          component: <span className={baseClass}>{status}</span> 
        };
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const showCheckboxes = !!onSelect;

  return (
    <div className="flex flex-col gap-4">
      {onExport && (
        <div className="flex justify-end">
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            导出数据 (CSV)
          </button>
        </div>
      )}
      <div className="overflow-hidden shadow-sm shadow-slate-200 rounded-xl bg-white border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              {showCheckboxes && (
                <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                  />
                </th>
              )}
              <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sm:pl-6">项目/论文名称</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">类别</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">负责人</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">日期</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {data.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const { isMasked } = getResearchMaskingStatus(item, currentUser, RESEARCH_SUBTYPES);
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr 
                  key={item.id} 
                  className={`
                    group transition-all duration-200 ease-in-out relative
                    hover:bg-slate-50 hover:shadow-md hover:z-10
                    ${isSelected ? 'bg-indigo-50/40' : ''}
                  `}
                >
                  {showCheckboxes && (
                    <td className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={isSelected}
                        onChange={(e) => onSelect?.(item.id, e.target.checked)}
                      />
                    </td>
                  )}
                  <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-800 sm:pl-6 max-w-xs overflow-hidden text-ellipsis ${isSelected ? 'border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}>
                    {item.title}
                    <div className="text-xs text-slate-500 font-normal truncate mt-0.5 flex items-center">
                       {isMasked ? (
                         <span className="flex items-center text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit mt-1">
                           <Shield className="w-3 h-3 mr-1" /> 
                           敏感信息已脱敏
                         </span>
                       ) : (
                         item.details
                       )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.category}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.authorName}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {statusConfig.component}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-3">
                      {/* Research Admin Actions */}
                      {currentUser.role === 'research_admin' && (item.status || '').toLowerCase() === 'pending' && (
                        <>
                          <button onClick={() => onApprove?.(item.id)} className="text-emerald-600 hover:text-emerald-900 transition-colors" title="通过">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button onClick={() => onReject?.(item.id)} className="text-red-600 hover:text-red-900 transition-colors" title="驳回">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Teacher Actions */}
                      {currentUser.role === 'teacher' && (
                        <>
                          {item.status === 'Draft' && item.authorId === currentUser.id && (
                            <>
                              <button onClick={() => onSubmit?.(item.id)} className="text-blue-600 hover:text-blue-900" title="提交审核">
                                <Send className="h-4 w-4" />
                              </button>
                              <button className="text-indigo-600 hover:text-indigo-900" title="编辑">
                                <Edit className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* Detail View (All Roles) */}
                      <button 
                        onClick={() => onViewDetail && onViewDetail(item)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors" 
                        title="查看详情"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {/* System Admin Actions */}
                      {currentUser.role === 'sys_admin' && (
                        <button onClick={() => onDelete?.(item.id)} className="text-red-600 hover:text-red-900" title="删除">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={showCheckboxes ? 7 : 6} className="text-center py-12 text-slate-400">
                  暂无相关数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
