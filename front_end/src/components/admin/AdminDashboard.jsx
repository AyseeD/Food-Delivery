import React, {useState, useEffect} from "react";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [userLength, setUserLength] = useState(0);
  const [restaurantLength, setRestaurantLength] = useState(0);
  const [orderLength, setOrderLength] = useState(0);

  useEffect(() => {
    async function fetchUserAmount() {
      try {
        const res = await fetch("http://localhost:4000/auth/admin/userAmount");
        const data = await res.json();
        setUserLength(data);
      } catch (error) {
        console.error("Failed to load users amount:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAmount();
  }, []);

  useEffect(() =>{
    async function fetchRestaurantAmount() {
      try{
        const res = await fetch("http://localhost:4000/auth/admin/restaurantAmount");
        const data = await res.json();
        setRestaurantLength(data);
      }catch(error){
        console.error("Failed to load restaurants amount:", error);
      }finally{
        setLoading(false);
      }
    }

    fetchRestaurantAmount();
  }, []);

  useEffect(()=>{
    async function fetchOrderAmount() {
      try{
        const res = await fetch("http://localhost:4000/auth/admin/orderAmount");
        const data = await res.json();
        setOrderLength(data);
      }catch(error){
        console.error("Failed to load orders amount:", error);
      }finally{
        setLoading(false);
      }
    }

    fetchOrderAmount();
  }, []);
  
  if (loading) return <p>Loading menu...</p>;

  return (
    <section>
      <h3 className="admin-section-title">Dashboard Overview</h3>

      <div className="dashboard-cards">
        <div className="dash-card">
          <h4>Total Users</h4>
          <p>{userLength}</p>
        </div>

        <div className="dash-card">
          <h4>Total Restaurants</h4>
          <p>{restaurantLength}</p>
        </div>

        <div className="dash-card">
          <h4>Total Orders</h4>
          <p>{orderLength}</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
