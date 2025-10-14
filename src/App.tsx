import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
        

function App() {
  const [data1, setData1] = useState([]);   //data source for the table
  const [pagination, setPagination] = useState(1);  //state to manage pagination
  const [selectedRows, setSelectedRows] = useState([]); //state to manage selected rows

  useEffect(() => {
    fetch(`https://api.artic.edu/api/v1/artworks?page=${pagination}`)
      .then(response => response.json())
      .then(data => {setData1(data.data); console.log(data);
      }) 
      .catch(error => console.error('Error fetching data:', error));
  }, [pagination]); //dependency array includes pagination to refetch data on page change

  return (
    <>

      <DataTable 
        value={data1} //data source for the table
        paginator //enable pagination
        rows={20} //number of rows per page
        totalRecords={10824} //total number of records in the dataset
        lazy //enable lazy loading
        first={(pagination - 1) * 20} //calculate the first record index for the current page
        onPage={(e) => setPagination(e.page + 1)} //update pagination state on page change
        selection={selectedRows}  //bind selected rows to state
        onSelectionChange={(e) => setSelectedRows(e.value)} //update selected rows state on selection change
        dataKey="id"  //unique identifier for each row
        selectionMode="checkbox"  //enable checkbox selection
        >
        <Column selectionMode="multiple" headerStyle={{width: '3rem'}}>
        </Column>  //checkbox column for selection
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist Display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>  
      </DataTable>
    
    
    
    
        
    
    </>
  );
}

export default App;
