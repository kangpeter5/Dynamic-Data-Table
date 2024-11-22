'use client'; // Ensure React hooks work in the App Router
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTableProps, SortConfig } from './types';

const DataTable: React.FC<DataTableProps> = ({ columns, fetchUrl }) => {
	const [data, setData] = useState<Record<string, any>[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>('');

	const rowsPerPage = 5;

	// Fetch data from the API
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(fetchUrl);
				if (!response.ok) {
					throw new Error('Failed to fetch data');
				}
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [fetchUrl]);

	// Handle sorting
	const sortedData = useMemo(() => {
		if (!sortConfig) return data;

		return [...data].sort((a, b) => {
			if (a[sortConfig.key] < b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? -1 : 1;
			}
			if (a[sortConfig.key] > b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? 1 : -1;
			}
			return 0;
		});
	}, [data, sortConfig]);

	// Handle searching
	const filteredData = useMemo(() => {
		if (!searchQuery) return sortedData;

		return sortedData.filter((row) =>
			columns.some((col) => row[col]?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
		);
	}, [sortedData, searchQuery, columns]);

	// Paginate data
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;
		return filteredData.slice(startIndex, endIndex);
	}, [currentPage, filteredData]);

	const totalPages = Math.ceil(filteredData.length / rowsPerPage);

	// Handle sorting click
	const handleSort = (key: string) => {
		setSortConfig((prev) =>
			prev && prev.key === key
				? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
				: { key, direction: 'ascending' }
		);
	};

	// Handle search with debounce
	const debounce = (func: (...args: any[]) => void, delay: number) => {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), delay);
		};
	};

	const handleSearch = useCallback(
		debounce((value: string) => {
			setSearchQuery(value);
			setCurrentPage(1); // Reset to first page
		}, 300),
		[]
	);

	if (loading) {
		return <p className="text-center text-gray-500">Loading data...</p>;
	}

	if (error) {
		return <p className="text-center text-red-500">Error: {error}</p>;
	}

	return (
		<div>
			{/* Search Bar */}
			<input
				type="text"
				placeholder="Search..."
				onChange={(e) => handleSearch(e.target.value)}
				className="mb-4 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>

			{/* Table */}
			<table className="w-full table-auto border-collapse border border-gray-200">
				<thead>
					<tr className="bg-gray-100">
						{columns.map((col) => (
							<th
								key={col}
								onClick={() => handleSort(col)}
								className="p-2 text-left cursor-pointer border-b border-gray-300"
							>
								{col}
								{sortConfig?.key === col && (
									<span className="ml-2">{sortConfig.direction === 'ascending' ? '🔼' : '🔽'}</span>
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{paginatedData.length > 0 ? (
						paginatedData.map((row, index) => (
							<tr
								key={index}
								className="hover:bg-gray-50 odd:bg-gray-50 even:bg-white"
							>
								{columns.map((col) => (
									<td
										key={col}
										className="p-2 border-b border-gray-200 text-sm text-gray-700"
									>
										{row[col] ?? '-'}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columns.length}
								className="p-4 text-center text-gray-500"
							>
								No data found
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{/* Pagination */}
			<div className="mt-4 flex justify-center items-center space-x-4">
				<button
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
					className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<span>
					Page {currentPage} of {totalPages}
				</span>
				<button
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
					disabled={currentPage === totalPages}
					className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default DataTable;
