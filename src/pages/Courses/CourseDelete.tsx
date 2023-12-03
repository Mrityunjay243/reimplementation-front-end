import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {HttpMethod} from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {ICourseResponse as ICourse} from "../../utils/interfaces";

/**
 * @author Mrityunjay Joshi on December, 2023
 */

interface IDeleteCourse {
  courseData: ICourse;
  onClose: () => void;
}

const DeleteCourse: React.FC<IDeleteCourse> = ({ courseData, onClose }) => {
  const { data: deletedCourse, error: courseError, sendRequest: DeleteCourse } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete user
  const deleteHandler = () =>
    DeleteCourse({ url: `/users/${courseData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (courseError) dispatch(alertActions.showAlert({ variant: "danger", message: courseError }));
  }, [courseError, dispatch]);

  // Close modal if user is deleted
  useEffect(() => {
    if (deletedCourse?.status && deletedCourse?.status >= 200 && deletedCourse?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Course ${courseData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [deletedCourse?.status, dispatch, onClose, courseData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete course <b>{courseData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          Cancel
        </Button>
        <Button variant="outline-danger" onClick={deleteHandler}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCourse;
