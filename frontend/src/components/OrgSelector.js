import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrgSelector() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/orgList');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const handleSelectOrg = (orgId) => {
    navigate(`/inbound/history/${orgId}`);
  };

  return (
    <div>
      <h1>Bridge Legal Inbound Alert Tool</h1>
      <h1>Select an Organization</h1>
      <select defaultValue="" onChange={(e) => handleSelectOrg(e.target.value)}>
        <option value="" disabled>Choose...</option>
        {organizations.map((org) => (
          <option key={org.organization_id} value={org.organization_id}>
            Organization {org.organization_id}
          </option>
        ))}
      </select>
    </div>
  );
}

export default OrgSelector;
