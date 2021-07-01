import React from "react";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as Yup from "yup";

import { UsersAPI } from "../api/index.js";

const LoginForm = (props) => {

    const { onClose, open } = props;

    // if (props.isAuthenticated()) {
    //     return <Typography align="center">
    //         You are already logged in.
    //     </Typography >;
    // }

    return (
        <div>
            <h1 className="title is-1">Log In</h1>
            <hr />
            <br />
            <Formik
                initialValues={{
                    email: "",
                    password: "",
                }}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    props.handleLoginFormSubmit(values);
                    resetForm();
                    setSubmitting(false);
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .email("Enter a valid email.")
                        .required("Email is required."),
                    password: Yup.string().required("Password is required."),
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
                                        errors.password && touched.password
                                            ? "input error"
                                            : "input"
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
        </div>
    );
};

LoginForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    // handleLoginFormSubmit: PropTypes.func.isRequired,
    // isAuthenticated: PropTypes.func.isRequired,
};

export default LoginForm;
