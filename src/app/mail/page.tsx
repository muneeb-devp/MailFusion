import React from "react";
import Mail from "./mail";

type Props = {};

const MailDashboard = (props: Props) => {
  return (
    <Mail
      defaultCollapsed={false}
      defaultLayout={[20, 32, 48]}
      navCollapsedSize={4}
    />
  );
};

export default MailDashboard;
