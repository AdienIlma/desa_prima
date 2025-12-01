import Table from "./Table";

const DataTable = ({ desaList, filteredDesa, columns, isMobile, onUpdate, highlightedId }) => {
  return (
    <>
      {desaList.length === 0 ? (
        <p className="text-center text-lg text-gray-500">
          Tidak ada data desa.
        </p>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table
            columns={columns}
            initialData={filteredDesa}
            isMobile={isMobile}
            onUpdate={onUpdate}
            highlightedId={highlightedId}
          />
        </div>
      )}
    </>
  );
};

export default DataTable;