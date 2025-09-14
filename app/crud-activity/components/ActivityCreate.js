import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  createOne as createActivity,
  validate as validateActivity,
} from '../data/activities';
import ActivityForm from './ActivityForm';
import PageContainer from './PageContainer';
import { useRouter } from "next/navigation";

const INITIAL_FORM_VALUES = {
  PRIORITY: 'LOW',
  COMPLETION: false,
};

export default function ActivityCreate() {
  const router = useRouter();
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name, value) => {
      const validateField = async (values) => {
        const { issues } = validateActivity(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateActivity(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      await createActivity(formValues);
      notifications.show('Activity created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/activities');
    } catch (createError) {
      notifications.show(
        `Failed to create activity. Reason: ${createError.message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="New Activity"
      breadcrumbs={[{ title: 'Activities', path: '/activities' }, { title: 'New' }]}
    >
      <ActivityForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}
