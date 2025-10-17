import React, { useEffect, useState, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import type {InputNumberValueChangeEvent} from 'primereact/inputnumber';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

// Artwork interface
interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const App: React.FC = () => {
    const [data, setData] = useState<Artwork[]>([]);
    const [page, setPage] = useState<number>(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [numRows, setNumRows] = useState<number>(0);
    const op = useRef<OverlayPanel>(null);

    // Fetch data
    useEffect(() => {
        fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`)
            .then(res => res.json())
            .then((res: { data: Artwork[] }) => setData(res.data))
            .catch(console.error);
    }, [page]);

    // Select rows across pages
    const handleSelectRows = async (): Promise<void> => {
        if (numRows <= 0) return;

        const selected: number[] = [...selectedIds];
        let currentPage = 1;

        while (selected.length < numRows) {
            const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`);
            const dataRes: { data: Artwork[] } = await res.json();

            const ids = dataRes.data.map(a => a.id);
            const remaining = numRows - selected.length;
            selected.push(...ids.slice(0, remaining));

            if (dataRes.data.length === 0) break;
            currentPage++;
        }

        setSelectedIds(selected);
        op.current?.hide();
    };

    const overlayButton = useMemo(
        () => <Button label="^" onClick={e => op.current?.toggle(e)} />,
        []
    );

    return (
        <div>
            <OverlayPanel ref={op} showCloseIcon dismissable>
                <div className="flex flex-col gap-2">
                    <span>Enter number of rows to select:</span>
                    <InputNumber
                        value={numRows}
                        onValueChange={(e: InputNumberValueChangeEvent) => setNumRows(e.value ?? 0)}
                        min={0}
                    />
                    <Button label="Select Rows" onClick={handleSelectRows} />
                </div>
            </OverlayPanel>

            <DataTable
                value={data}
                paginator
                rows={12}
                totalRecords={10824}
                lazy
                first={(page - 1) * 12}
                onPage={(e: DataTablePageEvent) => e.page !== undefined && setPage(e.page + 1)}
                selection={data.filter(a => selectedIds.includes(a.id))}
                onSelectionChange={e => {
                    const newSelected = e.value.map(a => a.id);
                    const others = selectedIds.filter(id => !data.some(d => d.id === id));
                    setSelectedIds([...others, ...newSelected]);
                }}
                dataKey="id"
                selectionMode="checkbox"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column header={overlayButton} />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Place of Origin" />
                <Column field="artist_display" header="Artist Display" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date Start" />
                <Column field="date_end" header="Date End" />
            </DataTable>
        </div>
    );
};

export default App;
