import { useEffect, useState } from 'react'
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
    return new Matrix(this.data)
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

type DataTableProps = {
  rows: number
  cols: number
  freq: number
}

const DataTable = ({ rows, cols, freq }: DataTableProps) => {
  const [data, setData] = useState(Matrix.zeros(rows, cols, 0))

  useEffect(() => {
    const id = setInterval(() => {
      setData((m) => {
        for (let j=0; j < cols; j++) {
          const v = Math.random();
          const i = Math.floor(v * rows);
          m.set(i, j, v);
        }
        return m.clone();
      })
    }, 1000/freq)

    return () => clearInterval(id)
  }, [rows, cols, freq]);

  return (
    <table>
      <tbody>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <td key={j}>
              {data.get(i, j)}
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
