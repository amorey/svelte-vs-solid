import { destructure } from '@solid-primitives/destructure';
import { createSolidTable, flexRender, getCoreRowModel } from '@tanstack/solid-table';
import type { ColumnDef } from '@tanstack/solid-table';
import { For, Show, batch, createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store';
import type { JSX } from 'solid-js'
import './App.css'

/**
 * Helper methods
 */

const newGrid = (rows: number, cols: number) => Array.from({ length: rows }, () => Array(cols).fill(0));

/**
 * DataTable component
 */

type DataTableProps = {
  rows: number
  cols: number
  freq: number
}

const DataTable = (props: DataTableProps) => {
  const { rows, cols, freq } = destructure(props)

  // Per-cell reactive store
  const [data, setData] = createStore<number[][]>(newGrid(rows(), cols()))

  // Re-shape grid on rols/cols change
  createEffect(() => {
    const r = rows();
    const c = cols();
    setData(newGrid(r, c))
  })

  // Ticker
  createEffect(() => {
    const r = rows();
    const c = cols();
    const f = freq();

    if (r <= 0 || c <= 0 || f <= 0) return

    let rev = 1;
    const intervalMs = 1000 / f;

    const id = setInterval(() => {
      untrack(() => {
        batch(() => {
          for (let j = 0; j < c; j++) {
            const i = Math.floor(Math.random() * r)
            setData(i, j, rev)
          }
          rev += 1
        })
      })
    }, intervalMs)

    onCleanup(() => clearInterval(id))
  })

  // Solid component
  const Cell = (p: { i: number; j: number }) => {
    return <>{data[p.i][p.j]}</>;
  };

  // --- Memoized columns based on matrix width ---
  const columns = createMemo<ColumnDef<number[], number>[]>(() => {
    return Array.from({ length: cols() }, (_, c) => ({
      id: `col_${c}`,
      header: () => `Col ${c}`,
      accessorFn: (_row) => 0,
      cell: (ctx) => <Cell i={ctx.row.index} j={c} />,
    }))
  })

  // --- Memoized table data object ---
  const tableData = createMemo(() => {
    rows();
    cols();
    return untrack(() => [...data]);
  })

  // --- Table instance depends on the store ---
  const table = createSolidTable({
    get data() {
      return tableData();
    },
    get columns() {
      return columns()
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <thead>
        <For each={table.getHeaderGroups()}>
          {(hg) => (
            <tr>
              <For each={hg.headers}>
                {(header) => (
                  <th class="border px-2 py-1 text-left font-semibold">
                    <Show
                      when={!header.isPlaceholder}
                      fallback={<span>&nbsp;</span>}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Show>
                  </th>
                )}
              </For>
            </tr>
          )}
        </For>
      </thead>
      <tbody>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <tr>
              <For each={row.getVisibleCells()}>
                {(cell) => (
                  <td class="border px-2 py-1">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
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
