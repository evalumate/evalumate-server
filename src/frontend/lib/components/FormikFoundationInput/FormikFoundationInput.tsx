import React, { FunctionComponent } from "react";
import { Field, FieldAttributes, FieldProps, getIn } from "formik";

export const FormError: FunctionComponent<{}> = ({ children }) => (
  <span className="form-error is-visible">{children}</span>
);

// TODO: Switch to useField as soon as it is available in Formik
export const FormikFoundationInput: FunctionComponent<FieldAttributes<any>> = ({
  render,
  placeholder,
  maxLength,
  label = "",
  ...props
}) => {
  return (
    <Field
      {...props}
      render={({ field, form }: FieldProps<any>) => {
        const isInvalid = getIn(form.touched, field.name) && getIn(form.errors, field.name);
        return (
          <div>
            {label && <label>{label}</label>}
            <input
              type="text"
              {...field}
              {...{ placeholder, maxLength }}
              className={isInvalid ? "is-invalid-input" : ""}
            />
            {isInvalid && <FormError>{getIn(form.errors, field.name)}</FormError>}
          </div>
        );
      }}
    />
  );
};
