import React, { useState, useEffect } from "react"  
import {createRoot} from "react-dom"
import Axios from "axios"
import NewForm from "./components/NewForm"
import CampaignCard from "./components/CampaignCard"

function App() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    async function go() {
      const response = await Axios.get("/api/campaigns");
      setCampaigns(response.data);
    }
    go();
  }, []);

  return (
    <div className="container">
      <NewForm setCampaigns={setCampaigns} />

      <div className="campaign-grid">
        {campaigns.map(function (campaign) {
          return (
            <CampaignCard key={campaign._id}
              name={campaign.name}
              brand={campaign.brand}
              conversionType={campaign.conversionType}
              bid={campaign.bid}
              target={campaign.target}

              photo={campaign.photo}
              id={campaign._id}
              setCampaigns={setCampaigns}
            />
          );
        })}
      </div>
    </div>
  );
}

const root = createRoot(document.querySelector("#app"))
root.render(<App />)