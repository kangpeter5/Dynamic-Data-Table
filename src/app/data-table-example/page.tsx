import React from 'react';
import DataTable from '@/components/DataTable/DataTable';

const DataTableExamplePage: React.FC = () => {
	const columns = ['id', 'name', 'email'];
	const fetchUrl = 'https://jsonplaceholder.typicode.com/users';

	return (
		<div className="p-8">
			<h1 className="text-xl font-bold mb-4">Data Table Example</h1>
			<DataTable
				columns={columns}
				fetchUrl={fetchUrl}
			/>
		</div>
	);
};

export default DataTableExamplePage;
