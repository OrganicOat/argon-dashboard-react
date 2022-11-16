import  { useState, useEffect, useRef } from 'react'
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip,
  Input
} from "reactstrap";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { exportFileType, exportFileExtension, exportDefaultSheetName, exportDefaultBookType } from 'utils/constants';

const DataTable = (props) => {

  const excelRef = useRef()
  const { col, _data, isExportExcel, pageLength } = props
  const defaultPagination = { activePage: 1, length: pageLength || 5, totalPage: Math.ceil(_data.length / (pageLength || 10)) || 0 }

  const [filterInput, setFilterInput] = useState({})
  const [data, setData] = useState(_data)
  const [tableData, setTableData] = useState([])
  const [pagination, setPagination] = useState(defaultPagination)
  const [sort, setSort] = useState({name: null, type: null})
  const { activePage, length, totalPage } = pagination

  useEffect(() => {
    _handlePageChange(activePage)
  }, [_data, data])

  const _handleFilterChange = (event) => {
    const { id, value } = event.target
    const newFilterInput = Object.fromEntries(Object.entries({ ...filterInput, [id]: value }).filter(([_, v]) => v != null && v !== ''));

    const newData = Object.keys(newFilterInput).length > 0 ? _data.filter(function (eachObj) {
      return Object.keys(newFilterInput).every(function (eachKey) {
        return String(eachObj[eachKey]).toLowerCase().includes(newFilterInput[eachKey].toLowerCase());
      });
    }) : _data

    const newPagination = { activePage: 1, length: pageLength || 5, totalPage: Math.ceil(newData.length / (pageLength || 10)) || 0 }

    setFilterInput(newFilterInput)
    setData(newData)
    setPagination(newPagination)
  }

  const _handleReset = () => {
    setFilterInput({})
    setData(_data)
    setPagination(defaultPagination)
  }

  const _handleSort = (event) => {
    const name = event.target.getAttribute('name')
    const type = sort?.name === name && sort.type === 'asc' ? 'desc' : 'asc'

    const newData = data.sort((a, b) => {
      let x = type === 'asc' ? a[name] : b[name];
      let y = type === 'asc' ? b[name] : a[name];

      if (typeof x === 'string') {
        x = x.charCodeAt();
      }
      if (typeof y === 'string') {
        y = y.charCodeAt();
      }

      return x - y;
    });

    setData([...newData])
    setSort({ name, type })
  }

  const _handlePageChange = (page) => {
    const newPagination = { ...pagination, activePage: page }

    const newData = data?.filter((v, i) => {
      const start = length * (page - 1);
      const end = start + length;
      return i >= start && i < end;
    }) || []

    setTableData(newData)
    setPagination(newPagination)
  }

  const exportExcel = () => {
    const exportData = data.map(item => {
      let rowData = {}
      col.forEach(_col => rowData = {...rowData, [_col.title]: item[_col.identifier]})
      return rowData
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { data: ws }, SheetNames: [exportDefaultSheetName] };
    const excelBuffer = XLSX.write(wb, { bookType: exportDefaultBookType, type: "array" });
    const finalData = new Blob([excelBuffer], { type: exportFileType });
    FileSaver.saveAs(finalData, 'data' + exportFileExtension);
  }

  return (
    <>
    <Card className="shadow">
      <CardHeader className="border-0 d-flex">
        <div className='text-left'>
          <h1 className="mb-0">Data tables</h1>
        </div>

        <div className='ml-auto'>
          <button className='btn-icon-only text-light btn btn- btn-sm' onClick={_handleReset}> 
            <i class="fas fa-redo" />
          </button>
          {(isExportExcel) &&
            <UncontrolledDropdown>
              <DropdownToggle
                className="btn-icon-only text-light"
                href="#pablo"
                role="button"
                size="sm"
                color=""
              >
                <i className="fas fa-ellipsis-v" />
              </DropdownToggle>
              {isExportExcel &&
                <DropdownMenu className="dropdown-menu-arrow" right>
                  <DropdownItem href="#pablo" onClick={exportExcel}>
                    Excel
                  </DropdownItem>
                </DropdownMenu>
              }
            </UncontrolledDropdown>
          }
        </div>
      </CardHeader>
      <Table className="align-items-center table-flush" responsive>
        <thead className="thead-light">
          <tr>
            {col.map((item) => (
              <th key={`header-${item.identifier}`} scope="col">
                <span name={item.identifier} className='d-block' style={{ cursor: 'pointer' }} onClick={_handleSort}
                >{item?.title}</span>
                <Input id={item.identifier} value={filterInput[item.identifier] || ''} onChange={_handleFilterChange} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 ? tableData.map((dataItem) => (
              <tr key={`row-${dataItem.id}`}>
                {
                  col.map((item) => (
                    <td key={`${dataItem.id}-${item.identifier}`}>
                      {((item?.render && item?.render(dataItem)) || (<span>{dataItem[item?.identifier]}</span>))}
                    </td>
                  ))
                }
              </tr>
            )) : (
              <tr>
                <td colSpan={col.length} className="text-center">
                  No Data to display
                </td>
              </tr>
          )}
        </tbody>
      </Table>
      <CardFooter className="py-4">
        <nav aria-label="...">
          {totalPage > 0 &&
            <Pagination
              className="pagination justify-content-end mb-0"
              listClassName="justify-content-end mb-0"
            >
              <PaginationItem className={activePage === 1 && "disabled"}>
                <PaginationLink
                  onClick={() => _handlePageChange(activePage - 1)}
                >
                  <i className="fas fa-angle-left" />
                  <span className="sr-only">Previous</span>
                </PaginationLink>
              </PaginationItem>
              {Array(totalPage).fill().map((item, index) => (
                <PaginationItem className={activePage === (index + 1) && "active"}>
                  <PaginationLink
                    onClick={() => _handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem className={activePage === totalPage && "disabled"}>
                <PaginationLink
                  href="#pablo"
                  onClick={() => _handlePageChange(activePage + 1)}
                >
                  <i className="fas fa-angle-right" />
                  <span className="sr-only">Next</span>
                </PaginationLink>
              </PaginationItem>
            </Pagination>
           }
        </nav>
      </CardFooter>
    </Card>
    </>
  )
}

export default DataTable