import { PhoneOutlined, MailOutlined } from "@ant-design/icons"

const PropertyDetails = ({ property }) => {
  return (
    <div>
      <h1>{property.title}</h1>
      <p>{property.description}</p>
      <div>
        <h2>Contact</h2>
        <div>
          <PhoneOutlined /> {property.agent.phone}
        </div>
        <div>
          <MailOutlined /> {property.agent.email}
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails
