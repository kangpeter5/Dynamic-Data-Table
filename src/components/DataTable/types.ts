export interface DataTableProps {
	columns: string[];
	fetchUrl: string;
}

export interface SortConfig {
	key: string;
	direction: 'ascending' | 'descending';
}
