import React from 'react';
import { ChevronUp, ChevronDown, PencilLine, Trash, Loader } from 'lucide-react';

const MatterHeader = ({ matter, isExpanded, setIsExpanded, openEditMatterModal, handleDeleteMatter, isDeletingMatter }) => {
    return (
        <div className='flex items-center justify-between mb-2'>
            <div
                className='flex gap-2 items-center min-w-0 flex-1 cursor-pointer hover:opacity-70 transition-opacity'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`rounded-full min-w-4 w-4 h-4 text-white ${matter.color === '#ff6467' ? 'bg-red-400' : matter.color === '#05df72' ? 'bg-green-400' : matter.color === '#50a2ff' ? 'bg-blue-400' : matter.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                <div className='flex items-center gap-2 min-w-0'>
                    <h3 className="font-bold text-lg truncate lg:max-w-100" title={matter.title}>{matter.title}</h3>
                </div>
                <div className="text-base-content/50 ml-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            <div className='flex gap-2 ml-4'>
                <button onClick={openEditMatterModal} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0 '>
                    <PencilLine className={`${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15} />
                </button>
                <button disabled={isDeletingMatter} onClick={handleDeleteMatter} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0' title='Deletar Matéria'>
                    {isDeletingMatter ? <Loader size={15} className="animate-spin" /> : <Trash className='hover:text-red-400' size={15} />}
                </button>
            </div>
        </div>
    );
};

export default MatterHeader;