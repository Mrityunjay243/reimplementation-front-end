import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { courseColumns as COURSE_COLUMNS } from "./CourseColumns";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteCourse from "./CourseDelete";
import { BsPersonFillAdd } from "react-icons/bs";
import { ICourseResponse, ROLE } from "../../utils/interfaces";
import { RootState } from "../../store/store";

/**
 * @author Mrityunjay Joshi on December, 2023
 */
const Courses = () => {
  const { error, isLoading, data: CourseResponse, sendRequest: fetchCourses } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchCourses({ url: `/courses/${auth.user.id}/managed` });
  }, [fetchCourses, location, showDeleteConfirmation.visible, auth.user.id]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteCourseHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<ICourseResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<ICourseResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => COURSE_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !CourseResponse?.data ? [] : CourseResponse.data),
    [CourseResponse?.data, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Courses</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <BsPersonFillAdd />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteCourse courseData={showDeleteConfirmation.data!} onClose={onDeleteCourseHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Courses;
