import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';

interface TestData {
  id: number;
  name: string;
  status: string;
}

const mockData: TestData[] = [
  { id: 1, name: 'Test 1', status: 'active' },
  { id: 2, name: 'Test 2', status: 'inactive' },
  { id: 3, name: 'Test 3', status: 'active' },
];

const mockColumns: Column<TestData>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <span className={value === 'active' ? 'active' : 'inactive'}>{value}</span>,
  },
];

describe('DataTable Component', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} emptyMessage="No records found" />);
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    const handleRowClick = vi.fn();
    render(<DataTable data={mockData} columns={mockColumns} onRowClick={handleRowClick} />);

    const firstRow = screen.getByText('Test 1').closest('tr');
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    }
  });

  it('renders pagination when provided', () => {
    const pagination = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: vi.fn(),
    };

    render(<DataTable data={mockData} columns={mockColumns} pagination={pagination} />);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });
});

