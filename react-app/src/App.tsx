import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import './App.css'

/**
 * Matrix class
 */

class Matrix<T> {
  private data: T[][]

  constructor(data: T[][]) {
    this.data = data;
  }

  get(i: number, j: number): T {
    return this.data[i][j]
  }

  set(i: number, j: number, value: T): void {
    this.data[i][j] = value
  }

  clone(): Matrix<T> {
    return new Matrix(this.data.map((row) => [...row]))
  }

  getOrElse(i: number, j: number, fallback: T): T {
    const row = this.data[i]
    if (!row) return fallback
    const value = row[j]
    return value === undefined ? fallback : value
  }

  static zeros<T>(rows: number, cols: number, initialValue?: T): Matrix<T> {
    const data = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => initialValue as T)
    );
    return new Matrix(data);
  }
}

/**
 * DataTable component
 */

type TableRow = { rowIndex: number } & Record<string, number>

type DataTableProps = {
  rows: number
  cols: number
  freq: number
}

const DataTable = ({ rows, cols, freq }: DataTableProps) => {
  const safeRows = Math.max(0, rows)
  const safeCols = Math.max(0, cols)

  const [data, setData] = useState(Matrix.zeros(safeRows, safeCols, 0))
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'row-index', desc: false },
  ])

  useEffect(() => {
    setData(Matrix.zeros(safeRows, safeCols, 0))
  }, [safeRows, safeCols])

  // Configure update ticker
  useEffect(() => {
    if (safeRows === 0 || safeCols === 0 || freq <= 0) {
      return
    }

    const intervalMs = 1000 / freq

    const id = setInterval(() => {
      setData((matrix) => {
        for (let j = 0; j < safeCols; j++) {
          const i = Math.floor(Math.random() * safeRows)
          matrix.set(i, j, (new Date()).getTime())
        }
        return matrix.clone()
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [safeRows, safeCols, freq])

  const columnIds = useMemo(() => {
    return Array.from({ length: safeCols }, (_, index) => `col-${index}`)
  }, [safeCols])

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    const valueColumns: ColumnDef<TableRow>[] = columnIds.map((columnId, index) => ({
      id: columnId,
      header: `Col ${index + 1}`,
      accessorKey: columnId,
      cell: (info) => info.getValue<number>().toFixed(5),
    }))

    return [
      {
        id: 'row-index',
        header: '#',
        accessorKey: 'rowIndex',
        cell: (info) => info.getValue<number>() + 1,
      },
      ...valueColumns,
    ]
  }, [columnIds])

  const tableData = useMemo<TableRow[]>(() => {
    return Array.from({ length: safeRows }, (_, rowIndex) => {
      const row: TableRow = { rowIndex }

      columnIds.forEach((columnId, columnIndex) => {
        row[columnId] = data.getOrElse(rowIndex, columnIndex, 0)
      })

      return row
    })
  }, [safeRows, columnIds, data])

  const table = useReactTable<TableRow>({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="sortable-column"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ^'}
                    {header.column.getIsSorted() === 'desc' && ' v'}
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * App component
 */

function App() {
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(3)
  const [freq, setFreq] = useState(1)

  const handleChangeRows = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseInt(ev.target.value, 10);
    if (!isNaN(next)) setRows(next)
  }

  const handleChangeCols = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseInt(ev.target.value, 10);
    if (!isNaN(next)) setCols(next)
  }

  const handleChangeFreq = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(ev.target.value)
    if (!isNaN(next)) setFreq(next)
  }

  return (
    <>
      <ul>
        <li>
          <label>Rows:</label>
          <input type="number" value={rows} onChange={handleChangeRows} />
        </li>
        <li>
          <label>Data Columns:</label>
          <input type="number" value={cols} onChange={handleChangeCols} />
        </li>
        <li>
          <label>Update frequency (hz):</label>
          <input type="number" value={freq} onChange={handleChangeFreq} />
        </li>
      </ul>
      <DataTable key={`${rows}-${cols}`} rows={rows} cols={cols} freq={freq} />
    </>
  )
}

export default App
