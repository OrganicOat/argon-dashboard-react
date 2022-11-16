import { memo } from 'react'
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
  UncontrolledTooltip
} from "reactstrap";
import Header from "components/Headers/Header.js";
import DataTable from "components/Common/DataTable";
import data from 'components/Common/data.json'

const CustomTables = () => {

  const col = [{
    title: 'Project',
    identifier: 'project',
  }, {
    title: 'Budget',
    identifier: 'budget',
    render: data => (`$ ${data?.budget} USD`)
  }, {
    title: 'Status',
    identifier: 'status',
  }, {
    title: 'Complete Percentage',
    identifier: 'completed_percentage',
    render: data => {
      const progressColor = data.completed_percentage > 90 ? 'bg-success' :
      data.completed_percentage > 80 ? 'bg-info' : 'bg-danger'
      return <div className="d-flex align-items-center"><span className="mr-2">{data.completed_percentage}%</span><Progress max="100" value={data.completed_percentage} barClassName={progressColor} /></div>
    }
  }];

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <DataTable
              col={col}
              _data={data || []}
              pageLength={5}
              isExportExcel
            />
          </div>
        </Row>
      </Container>
    </>
  );
};

export default memo(CustomTables);
