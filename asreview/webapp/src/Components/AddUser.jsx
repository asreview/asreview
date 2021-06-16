import React from "react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as yup from "yup";

import "./form.css";

const AddUser = (props) => (
  <Formik
    initialValues={{
      username: "",
      email: "",
      password: "",
    }}
    onSubmit={(values, { setSubmitting, resetForm }) => {
      props.addUser(values);
      resetForm();
      setSubmitting(false);
    }}
    // Validate the fileds of the form
    validationSchema={yup.object().shape({
      username: yup.string()
        .required("Username is required.")
        .min(6, "Username must be greater than 5 characters."),
      email: yup.string()
        .email("Enter a valid email.")
        .required("Email is required.")
        .min(6, "Email must be greater than 5 characters."),
      password: yup.string()
        .required("Password is required.")
        .min(11, "Password must be greater than 10 characters."),
    })}
  >
    {(props) => {
      const {
        values,
        touched,
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
      } = props;
      return (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="input-username">
              Username
            </label>
            <input
              name="username"
              id="input-username"
              className={
                errors.username && touched.username ? "input error" : "input"
              }
              type="text"
              placeholder="Enter a username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.username && touched.username && (
              <div className="input-feedback">{errors.username}</div>
            )}
          </div>
          <div className="field">
            <label className="label" htmlFor="input-email">
              Email
            </label>
            <input
              name="email"
              id="input-email"
              className={
                errors.email && touched.email ? "input error" : "input"
              }
              type="email"
              placeholder="Enter an email address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email && (
              <div className="input-feedback">{errors.email}</div>
            )}
          </div>
          <div className="field">
            <label className="label" htmlFor="input-password">
              Password
            </label>
            <input
              name="password"
              id="input-password"
              className={
                errors.password && touched.password ? "input error" : "input"
              }
              type="password"
              placeholder="Enter a password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password && (
              <div className="input-feedback">{errors.password}</div>
            )}
          </div>
          <input
            type="submit"
            className="button is-primary"
            value="Submit"
            disabled={isSubmitting}
          />
        </form>
      );
    }}
  </Formik>
);

AddUser.propTypes = {
  addUser: PropTypes.func.isRequired,
};

export default AddUser;
