const INITIAL_EMPLOYEES_STORE = [
  {
    id: 1,
    name: 'Edward Perry',
    age: 25,
    joinDate: '2025-07-16T00:00:00.000Z',
    role: 'Finance',
    isFullTime: true,
  },
  {
    id: 2,
    name: 'Josephine Drake',
    age: 36,
    joinDate: '2025-07-16T00:00:00.000Z',
    role: 'Market',
    isFullTime: false,
  },
  {
    id: 3,
    name: 'Cody Phillips',
    age: 19,
    joinDate: '2025-07-16T00:00:00.000Z',
    role: 'Development',
    isFullTime: true,
  },
];

export async function getActivitiesStore() {
  try {
    // เรียก API login จริง ๆ
    var dataInput = {
      user_id: JSON.parse(localStorage.getItem("user") || "{}")?.USER_ID,
    }
    console.log(dataInput);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataInput),
    });

    const data = await res.json();
    if (data.success) {
      console.log('data.activities:', data.activities);
      localStorage.setItem('activities-store', JSON.stringify(data.activities));
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
  const stringifiedActivities = localStorage.getItem('activities-store');
  console.log(JSON.parse(stringifiedActivities));

  return stringifiedActivities
    ? JSON.parse(stringifiedActivities)
    : INITIAL_EMPLOYEES_STORE;
}

export function setActivitiesStore(activities) {
  return localStorage.setItem('activities-store', JSON.stringify(activities));
}

export async function getMany({ paginationModel, filterModel, sortModel }) {
  const activitiesStore = await getActivitiesStore();
  console.log(activitiesStore);

  let filteredActivities = [...activitiesStore];

  // Apply filters (example only)
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, value, operator }) => {
      if (!field || value == null) {
        return;
      }

      filteredActivities = filteredActivities.filter((activity) => {
        const activityValue = activity[field];

        switch (operator) {
          case 'contains':
            return String(activityValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          case 'equals':
            return activityValue === value;
          case 'startsWith':
            return String(activityValue)
              .toLowerCase()
              .startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(activityValue)
              .toLowerCase()
              .endsWith(String(value).toLowerCase());
          case '>':
            return activityValue > value;
          case '<':
            return activityValue < value;
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (sortModel?.length) {
    filteredActivities.sort((a, b) => {
      for (const { field, sort } of sortModel) {
        if (a[field] < b[field]) {
          return sort === 'asc' ? -1 : 1;
        }
        if (a[field] > b[field]) {
          return sort === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // Apply pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  const paginatedActivities = filteredActivities.slice(start, end);

  return {
    items: paginatedActivities,
    itemCount: filteredActivities.length,
  };
}

export async function getOne(activityId) {
  const activitiesStore = await getActivitiesStore();
  console.log(activityId);

  const activityToShow = activitiesStore.find(
    (activity) => activity.TASK_ID === activityId,
  );

  if (!activityToShow) {
    throw new Error('Activity not found');
  }
  return activityToShow;
}

export async function createOne(data) {
  const activitiesStore = getActivitiesStore();

  const newActivity = {
    id: activitiesStore.reduce((max, activity) => Math.max(max, activity.id), 0) + 1,
    ...data,
  };

  setActivitiesStore([...activitiesStore, newActivity]);

  return newActivity;
}

export async function updateOne(activityId, data) {
  const activitiesStore = getActivitiesStore();

  let updatedActivity = null;

  setActivitiesStore(
    activitiesStore.map((activity) => {
      if (activity.id === activityId) {
        updatedActivity = { ...activity, ...data };
        return updatedActivity;
      }
      return activity;
    }),
  );

  if (!updatedActivity) {
    throw new Error('Activity not found');
  }
  return updatedActivity;
}

export async function deleteOne(activityId) {
  const activitiesStore = getActivitiesStore();

  setActivitiesStore(activitiesStore.filter((activity) => activity.id !== activityId));
}

// Validation follows the [Standard Schema](https://standardschema.dev/).

export function validate(activity) {
  let issues = [];

  if (!activity.TASK_NAME) {
    issues = [...issues, { message: 'Name is required', path: ['TASK_NAME'] }];
  }

  if (!activity.DUE_DATE) {
    issues = [...issues, { message: 'Join date is required', path: ['DUE_DATE'] }];
  }

  if (!activity.PRIORITY) {
    issues = [...issues, { message: 'Priority is required', path: ['PRIORITY'] }];
  } else if (!['Low', 'MEDIUM', 'HIGH'].includes(activity.role)) {
    issues = [
      ...issues,
      {
        message: 'Role must be "Low", "MEDIUM" or "HIGH"',
        path: ['PRIORITY'],
      },
    ];
  }

  return { issues };
}
