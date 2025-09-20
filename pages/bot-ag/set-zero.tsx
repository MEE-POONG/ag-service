import React, { useState, useEffect } from 'react';
import { TheLayout } from '@/components/TheLayout';
import PageHeader from '@/components/PageHeader';
import { Button, ButtonProps } from "@/components/ui/button"

import ReactIconComponent from '@/components/ReactIconComponent';
import ModalAdJustBetTest from '@/container/bot-ag/ModalAdJustBetTest';
import { useAdjustBet } from '@/hooks/useAdjustBet';
import { AdjustBet } from '@/types/adjustBet';
import toast from 'react-hot-toast';

const AdjustBetPage: React.FC = () => {
  const {
    adjustBets,
    isLoading,
    error,
    total,
    page,
    limit,
    fetchAdjustBets,
    deleteAdjustBet,
    clearError
  } = useAdjustBet();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: AdjustBet;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load adjust bets on component mount
  useEffect(() => {
    fetchAdjustBets({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, [fetchAdjustBets, currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdjustBets({
      page: 1,
      limit: 10,
      search: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Handle modal operations
  const openModal = (mode: 'create' | 'edit' | 'view', data?: AdjustBet) => {
    setModalState({
      isOpen: true,
      mode,
      data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const handleModalSuccess = () => {
    // Refresh the list
    fetchAdjustBets({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ "${name}"?`)) {
      return;
    }

    const success = await deleteAdjustBet(id);
    if (success) {
      toast.success('ลบ Adjust Bet สำเร็จ');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const totalPages = Math.ceil(total / limit);

  return (
    <TheLayout>
      <div className="space-y-6">
        <PageHeader
          title="จัดการ Adjust Bet"
          description="ระบบจัดการการปรับเบทสำหรับลูกค้า"
          breadcrumbs={[
            { name: 'Bot AG', href: '/bot-ag' },
            { name: 'Adjust Bet' }
          ]}
          actions={
            <Button
              onClick={() => openModal('create')}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
              สร้างใหม่
            </Button>
          }
        />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาตามชื่อ, รหัสลูกค้า, หรือ username..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
            >
              <ReactIconComponent icon="FaSearch" setClass="w-4 h-4 mr-2" />
              ค้นหา
            </Button>
          </form>
        </div>

        {/* Adjust Bets List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              รายการ Adjust Bet ({total} รายการ)
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลด...</span>
            </div>
          ) : adjustBets.length === 0 ? (
            <div className="text-center py-12">
              <ReactIconComponent icon="FaInbox" setClass="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูล</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มี Adjust Bet ในระบบ'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
                  สร้าง Adjust Bet แรก
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รหัสลูกค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username AG
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เกมที่เปิด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สร้างเมื่อ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adjustBets.map((adjustBet) => {
                      const enabledGames = [];
                      if (adjustBet.data?.sportsbook?.work) enabledGames.push('Sportsbook');
                      if (adjustBet.data?.sexy?.enabled) enabledGames.push('Sexy');
                      if (adjustBet.data?.sa?.enabled) enabledGames.push('SA');
                      if (adjustBet.data?.slotItp?.enabled) enabledGames.push('Slot ITP');
                      if (adjustBet.data?.slotJoker?.enabled) enabledGames.push('Slot JOKER');
                      if (adjustBet.data?.slotPlaystar?.enabled) enabledGames.push('Slot PLAYSTAR');
                      if (adjustBet.data?.cockfight?.enabled) enabledGames.push('Cockfight');
                      if (adjustBet.data?.muayStep?.enabled) enabledGames.push('Muay Step');
                      if (adjustBet.data?.virtualSports?.enabled) enabledGames.push('Virtual Sports');

                      return (
                        <tr key={adjustBet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {adjustBet.name}
                              </div>
                              {adjustBet.description && (
                                <div className="text-sm text-gray-500">
                                  {adjustBet.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adjustBet.data?.customer || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adjustBet.data?.usernameAG || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {enabledGames.slice(0, 3).map((game) => (
                                <span
                                  key={game}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {game}
                                </span>
                              ))}
                              {enabledGames.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{enabledGames.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {adjustBet.createdAt ? new Date(adjustBet.createdAt).toLocaleDateString('th-TH') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => openModal('view', adjustBet)}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                <ReactIconComponent icon="FaEye" setClass="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => openModal('edit', adjustBet)}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              >
                                <ReactIconComponent icon="FaEdit" setClass="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(adjustBet.id, adjustBet.name)}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                <ReactIconComponent icon="FaTrash" setClass="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      แสดง {((currentPage - 1) * limit) + 1} ถึง {Math.min(currentPage * limit, total)} จาก {total} รายการ
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ReactIconComponent icon="FaChevronLeft" setClass="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`inline-flex items-center px-3 py-1 rounded text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ReactIconComponent icon="FaChevronRight" setClass="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal */}
        <ModalAdJustBetTest
          data={modalState.data}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
          mode={modalState.mode}
        />
      </div>
    </TheLayout>
  );
};

export default AdjustBetPage;
