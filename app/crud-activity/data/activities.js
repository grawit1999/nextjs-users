
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const INITIAL_EMPLOYEES_STORE = [];

async function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (err) {
    return false; // invalid token ถือว่า expired
  }
}


export async function getActivitiesStore() {

  try {
    var dataInput = {
      USER_ID: JSON.parse(localStorage.getItem("user") || "{}")?.USER_ID
    }
    var accessToken = localStorage.getItem("access_token");
    var refresh_token
    //เช็ค isTokenExpired
    if (isTokenExpired(accessToken)) {
      console.log("🔴 Access token หมดอายุ");
      var refreshToken = localStorage.getItem("refresh_token");
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        refresh_token = data.refresh_token
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refresh_token);

        // retry request เดิม
        // res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        //   headers: { Authorization: `Bearer ${accessToken}` },
        // });
      } else {
        // refresh_token หมดอายุ → login ใหม่
        localStorage.clear();
        alert("🔴 Access token หมดอายุ");
        window.location.href = '/sign-in'
      }
    }
    // console.log(dataInput);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(dataInput),
    });
    const data = await res.json();
    if (data.success) {
      const activitiesWithIndex = data.activities.map((activity, index) => ({
        index: index + 1, // เริ่มจาก 1
        ...activity
      }));
      // console.log('data.activities:', activitiesWithIndex);
      localStorage.setItem('activities-store', JSON.stringify(activitiesWithIndex));
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
  const stringifiedActivities = localStorage.getItem('activities-store');
  // console.log(JSON.parse(stringifiedActivities));

  return stringifiedActivities
    ? JSON.parse(stringifiedActivities)
    : INITIAL_EMPLOYEES_STORE;
}

export function setActivitiesStore(activities) {
  return localStorage.setItem('activities-store', JSON.stringify(activities));
}

export async function getMany({ paginationModel, filterModel, sortModel }) {
  const activitiesStore = await getActivitiesStore();
  // console.log(activitiesStore);

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
  // console.log(activityId);

  const activityToShow = activitiesStore.find(
    (activity) => activity.TASK_ID === activityId,
  );

  if (!activityToShow) {
    throw new Error('Activity not found');
  }
  return activityToShow;
}

export async function createOne(data_) {
  const activitiesStore = await getActivitiesStore();
  const dataIn = data_
  const newActivity = {
    id: activitiesStore.reduce((max, activity) => Math.max(max, activity.TASK_ID), 0) + 1,
    ...dataIn,
  };
  try {
    var dataInput = {
      USER_ID: JSON.parse(localStorage.getItem("user") || "{}")?.USER_ID,
      TASK_NAME: dataIn.TASK_NAME,
      DUE_DATE: dataIn.DUE_DATE,
      PRIORITY: dataIn.PRIORITY,
      COMPLETION: dataIn.COMPLETION
    }
    var accessToken = localStorage.getItem("access_token");
    //เช็ค isTokenExpired
    if (isTokenExpired(accessToken)) {
      console.log("🔴 Access token หมดอายุ");
      var refreshToken = localStorage.getItem("refresh_token");
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        refresh_token = data.refresh_token
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refresh_token);

        // retry request เดิม
        // res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        //   headers: { Authorization: `Bearer ${accessToken}` },
        // });
      } else {
        // refresh_token หมดอายุ → login ใหม่
        localStorage.clear();
        alert("🔴 Access token หมดอายุ");
        window.location.href = '/sign-in'
      }

    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(dataInput),
    });

    const data = await res.json();
    if (data.success) {
      // console.log('data:', data);
      // localStorage.setItem('user', JSON.stringify(data.user));
      // router.push('/crud-activity');
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }

  setActivitiesStore([...activitiesStore, newActivity]);

  return newActivity;
}

export async function updateOne(activityId, data) {
  const activitiesStore = await getActivitiesStore();

  let updatedActivity = null;

  setActivitiesStore(
    activitiesStore.map(async (activity) => {
      if (activity.TASK_ID === activityId) {
        updatedActivity = { ...activity, ...data };
        try {
          var dataInput = {
            TASK_ID: updatedActivity.TASK_ID,
            TASK_NAME: updatedActivity.TASK_NAME,
            DUE_DATE: updatedActivity.DUE_DATE,
            PRIORITY: updatedActivity.PRIORITY,
            COMPLETION: updatedActivity.COMPLETION
          }
          var accessToken = localStorage.getItem("access_token");
          //เช็ค isTokenExpired
          if (isTokenExpired(accessToken)) {
            console.log("🔴 Access token หมดอายุ");
            var refreshToken = localStorage.getItem("refresh_token");
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              accessToken = data.access_token;
              refresh_token = data.refresh_token
              localStorage.setItem("access_token", accessToken);
              localStorage.setItem("refresh_token", refresh_token);

              // retry request เดิม
              // res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
              //   headers: { Authorization: `Bearer ${accessToken}` },
              // });
            } else {
              // refresh_token หมดอายุ → login ใหม่
              localStorage.clear();
              alert("🔴 Access token หมดอายุ");
              window.location.href = '/sign-in'
            }

          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(dataInput),
          });

          const data = await res.json();
          if (data.success) {
            // console.log('data:', data);
            // localStorage.setItem('user', JSON.stringify(data.user));
            // router.push('/crud-activity');
          } else {
            alert(data.message);
          }

        } catch (err) {
          console.error(err);
        }
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
  const activitiesStore = await getActivitiesStore();

  setActivitiesStore(activitiesStore.filter((activity) => activity.TASK_ID !== activityId));
  try {
    // เรียก API login จริง ๆ
    var dataInput = {
      TASK_ID: activityId
    }
    var accessToken = localStorage.getItem("access_token");
    //เช็ค isTokenExpired
    if (isTokenExpired(accessToken)) {
      console.log("🔴 Access token หมดอายุ");
      var refreshToken = localStorage.getItem("refresh_token");
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        refresh_token = data.refresh_token
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refresh_token);

        // retry request เดิม
        // res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        //   headers: { Authorization: `Bearer ${accessToken}` },
        // });
      } else {
        // refresh_token หมดอายุ → login ใหม่
        localStorage.clear();
        alert("🔴 Access token หมดอายุ");
        window.location.href = '/sign-in'
      }

    }
    // console.log(dataInput);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(dataInput),
    });

    const data = await res.json();
    if (data.success) {
      // console.log('data:', data);
      // localStorage.setItem('activities-store', JSON.stringify(data.activities));
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
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
  } else if (!['LOW', 'MEDIUM', 'HIGH'].includes(activity.PRIORITY)) {
    issues = [
      ...issues,
      {
        message: 'Role must be "LOW", "MEDIUM" or "HIGH"',
        path: ['PRIORITY'],
      },
    ];
  }

  return { issues };
}
