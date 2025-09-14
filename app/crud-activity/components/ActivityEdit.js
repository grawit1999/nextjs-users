import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  getOne as getActivity,
  updateOne as updateActivity,
  validate as validateActivity,
} from '../data/activities';
import ActivityForm from './ActivityForm';
import PageContainer from './PageContainer';
import { useRouter } from "next/navigation";

function ActivityEditForm({ initialValues, onSubmit }) {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: initialValues,
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
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

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
      await onSubmit(formValues);
      notifications.show('Activity edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/activities');
    } catch (editError) {
      notifications.show(`Failed to edit activity. Reason: ${editError.message}`, {
        severity: 'error',
        autoHideDuration: 3000,
      });
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors]);

  return (
    <ActivityForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Save"
      backButtonPath={`/activities/${activityId}`}
    />
  );
}

ActivityEditForm.propTypes = {
  initialValues: PropTypes.shape({
    age: PropTypes.number,
    isFullTime: PropTypes.bool,
    joinDate: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.oneOf(['Low', 'Medium', 'High']),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default function ActivityEdit() {
  const { activityId } = useParams();

  const [activity, setActivity] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getActivity(Number(activityId));

      setActivity(showData);
    } catch (showDataError) {
      setError(showDataError);
    }
    setIsLoading(false);
  }, [activityId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (formValues) => {
      const updatedData = await updateActivity(Number(activityId), formValues);
      setActivity(updatedData);
    },
    [activityId],
  );

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return activity ? (
      <ActivityEditForm initialValues={activity} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, activity, handleSubmit]);

  return (
    <PageContainer
      title={`Edit Activity ${activityId}`}
      breadcrumbs={[
        { title: 'Activities', path: '/activities' },
        { title: `Activity ${activityId}`, path: `/activities/${activityId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
