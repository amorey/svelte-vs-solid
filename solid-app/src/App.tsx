import { destructure } from '@solid-primitives/destructure';
import { For, createEffect, createSignal, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
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

type DataTableProps = {
  rows: number
  cols: number
  freq: number
}

const DataTable = (props: DataTableProps) => {
  const { rows, cols, freq } = destructure(props);
  const [data, setData] = createSignal(Matrix.zeros(rows(), cols(), 0));

  // Reset matrix when rows/cols change
  createEffect(() => {
    setData(() => Matrix.zeros(rows(), cols(), 0));
  })

  return (
    <table>
      <tbody>
        <For each={Array.from({ length: rows() }, (_, i) => i)}>
          {(i) => (
            <tr>
              <For each={Array.from({ length: cols() }, (_, j) => j)}>
                {(j) => (
                  <td>{data().getOrElse(i, j, 0)}</td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

/**
 * Display FPS component
 */

const DisplayFPS = () => {
  const [fps, setFps] = createSignal(0);

  createEffect(() => {
    let last = 0;
    let frames = 0;
    let rafId: number;

    const loop = (time: number) => {
      if (!last) last = time;
      frames++;

      const elapsed = time - last;
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed)); // frames per second
        frames = 0;
        last = time;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    onCleanup(() => cancelAnimationFrame(rafId));
  })

  return <span>{fps()}</span>;
}

/**
 * App component
 */

function App() {
  const [rows, setRows] = createSignal(10)
  const [cols, setCols] = createSignal(3)
  const [freq, setFreq] = createSignal(1.0)

  const handleChangeRows: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setRows(parseInt(next, 10))
  };

  const handleChangeCols: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setCols(parseInt(next, 10))
  };

  const handleChangeFreq: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setFreq(parseFloat(next))
  };

  return (
    <main>
      <div>
        FPS: <DisplayFPS />
      </div>
      <ul>
        <li>
          <label>Rows:</label>
          <input type="number" value={rows()} onChange={handleChangeRows} />
        </li>
        <li>
          <label>Data Columns:</label>
          <input type="number" value={cols()} onChange={handleChangeCols} />
        </li>
        <li>
          <label>Update frequency (hz):</label>
          <input type="number" value={freq()} onChange={handleChangeFreq} />
        </li>
      </ul>
      <DataTable rows={rows()} cols={cols()} freq={freq()} />
    </main>
  )
}

export default App
