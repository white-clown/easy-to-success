export default {
    routes: [
      {
        method: "POST",
        path: "/auth/register/step1",
        handler: "registration.step1",
        config: {
          policies: []
        }
      },
      {
        method: "POST",
        path: "/auth/register/step2",
        handler: "registration.step2",
        config: {
          policies: []
        },
      },
    ]
  };
  