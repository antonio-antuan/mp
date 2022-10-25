import Marketplace from '../services/marketplace'

import {
    useTable,
    usePagination,
    Row,
    UsePaginationInstanceProps, TableInstance, UsePaginationState
} from 'react-table';

import React from "react";
import {Order} from "../models/Order";

export type TableOptionsWithPagination<T extends object> = TableInstance<T> &
    UsePaginationInstanceProps<T> &
    {state: UsePaginationState<T>;}

export function Table({
                          columns,
                          data,
                          fetchData,
                          loading,
                          pageCount: controlledPageCount,
                      }: {
    columns: any,
    data: any[],
    fetchData: any,
    loading: any,
    pageCount: any
}) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        // Get the state from the instance
        state: {pageIndex, pageSize},
    } = useTable(
        {
            columns,
            data,
        },
        usePagination
    ) as TableOptionsWithPagination<Order>

    // Listen for changes in pagination and use the state to fetch our new data
    React.useEffect(() => {
        fetchData({pageIndex, pageSize})
    }, [fetchData, pageIndex, pageSize])

    // Render the UI for your table
    return (
        <>
      <pre>
        <code>
          {JSON.stringify(
              {
                  pageIndex,
                  pageSize,
                  pageCount,
                  canNextPage,
                  canPreviousPage,
              },
              null,
              2
          )}
        </code>
      </pre>
            <table {...getTableProps()}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>
                                {column.render('Header')}
                  {/*              <span>*/}
                  {/*  {column.isSorted*/}
                  {/*      ? column.isSortedDesc*/}
                  {/*          ? ' 🔽'*/}
                  {/*          : ' 🔼'*/}
                  {/*      : ''}*/}
                  {/*</span>*/}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {page.map((row: Row<any>, i: number) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
                <tr>
                    {loading ? (
                        // Use our custom loading state to show a loading indicator
                        <td>Loading...</td>
                    ) : (
                        <td>
                            Showing {page.length} of ~{controlledPageCount * pageSize}{' '}
                            results
                        </td>
                    )}
                </tr>
                </tbody>
            </table>
            {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>
                {' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>
                {' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>
                {' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>
                {' '}
                <span>
          Page{' '}
                    <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
                <span>
          | Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }}
                        style={{width: '100px'}}
                    />
        </span>{' '}
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}


export function CreateOrder() {
    const onClick = () => {
        Marketplace.createOrder()
    }
    return (
        <button onClick={onClick}>Create order</button>
    )
}