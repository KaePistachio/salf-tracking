import { useState } from 'react';
// import { Axios } from 'axios';
import './index.css'; 
import salf from './images/salf-logo-final.svg'; 
import banner from './images/banner.jpg'; 
import tick from './images/tick.png';
// import ShipsGoForm from './components/ShipsGoForm';

function App() {
  const [ trackingID, setTrackingID ] = useState(null);
  const [ shippingInfo, setShippingInfo ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(true); 
  const [ hasSubmitted, setHasSubmitted ] = useState(false); 

  const getShippingInfo = async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    return json;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ? Set hasSubmitted to true
    setHasSubmitted(true);

    // ? Show loading message
    setIsLoading(true);

    // ? Get data from API
    const data = await getShippingInfo(`https://shipsgo.com/api/ContainerService/GetContainerInfo/?authCode=3c942292bda93f85cfc1b1d0ed17be23&requestId=${trackingID}`);

    // ? Set data as state
    if ( data.Message === 'There Are No Data Related To Requested Id') {
      setShippingInfo('No Data')
    } else {
      setShippingInfo(data[0]);
    }
    

    // ? Set is loading back to false to show stuff in the UI
    setIsLoading(false);
    console.log(data.Message);
  }

  const onChange = (e) => {
    setTrackingID(e.target.value)
  }

  return (
    <div className="App">
      <div className='banner'><img src={banner} alt="banner"></img></div>
      <div className="container">
        <div className='header'>
          <img src={salf} alt="salf"/>
          <h1>Shipment Tracking</h1>
        </div>
        {/* <ShipsGoForm /> */}
        <form onSubmit={handleSubmit} >
          <input type="text" onChange={onChange}/>
          <button>Track Shipment</button>
        </form>
        <div className="please-submit">
          { !hasSubmitted ? 'Please Submit The Form' : <ShippingInfo shippingInfo={shippingInfo} isLoading={isLoading} />}
        </div>
      </div>
    </div>
  );
}

export default App;

const ShippingInfo = ({ shippingInfo, isLoading }) => {
  if (isLoading) {
    return 'Loading...'
  }

  const dateConversion = (date) => {
    if (date !== undefined) {
      const dateArray = date?.split('/');
      const dateString = `${ dateArray[2] }-${ dateArray[1] }-${ dateArray[0] }`
      const newDate = new Date(dateString);
      return newDate
    } else {
      return;
    }
  }

  const isPast = (date) => {
    const now = Math.round(new Date().getTime()/1000);
    if (now >= Math.round(date.getTime()/1000)) {
      return true;
    } else {
      return false;
    }
  }

  const dateSorter = () => {
    // Get now
    const now = Math.round(new Date().getTime()/1000);
      // console.log(now);

    // ? create array for dates
    const dates = [];

    // ? push initial arrival / departure dates from api res
    dates.push(dateConversion(shippingInfo?.ArrivalDate))
    dates.push(dateConversion(shippingInfo?.DepartureDate))

    // ? map and push dates from within TSPorts
    shippingInfo?.TSPorts.map(date => {
      dates.push(dateConversion(date.ArrivalDate));
      dates.push(dateConversion(date.DepartureDate));
      return dates;
    })

    // ? init array for past dates and map from previous array
    const pastDates = [];
    dates.map(date => {
      if (now >= date.getTime()/1000) {
          // console.log(date.getTime()/1000)
        pastDates.push(date);
      }
      return pastDates;
    });

    // ? create array for time difference, and then filter pastDates array for the one that matches the time difference
    const timeDifference = [];
    
    pastDates.map(date => {
      timeDifference.push(now - date.getTime() / 1000)
      return timeDifference;
    })
      // console.log(timeDifference);
    const activeEvent = pastDates.filter( 
                          timestamp => (now - timestamp.getTime() / 1000) === Math.min(...timeDifference)
                        );
      // console.log(activeEvent[0])

    // ? should now be a single value array so return the zero index
    return activeEvent[0];
  }

  const dateClass = (date) => {
    // ? runs datesorter function to determine if active event then if not determines whether past or present to asign class
    const latestDate = dateSorter();

    if (date.getTime() / 1000 === latestDate.getTime() / 1000) {
      return "active-event";
    } else if (isPast(date)) {
      return "past-event";
    } else {
      return "future-event"
    }
  }

  const departureDate = shippingInfo?.DepartureDate;
  const departureTime = dateConversion(departureDate);
  const arrivalDate = shippingInfo?.ArrivalDate;
  const arrivalTime = dateConversion(arrivalDate);


  if ( shippingInfo === 'No Data' ) {
    return (
      <div className="response-container">
        <h1>Non SALF Shipping ID Cannot Be Tracked!</h1>
      </div>
    )
  } else {
    return (
      <div className="response-container">
        <h1>Tracking Status</h1>
        <div className='grid'> 
          <h2 className='span3'>Shipment Information</h2>
          <h4>Ref ID: <br/>{ shippingInfo?.ReferenceNo }</h4>
          <h4>Origin:<br/>{ shippingInfo?.Pol }, { shippingInfo?.FromCountry }</h4>
          <h4>Destination:<br/>{ shippingInfo?.Pod }, { shippingInfo?.ToCountry }</h4>
          <h4>Status:<br/>{ shippingInfo?.SailingStatus }</h4>
          <h4>Departure Date:<br/>{ shippingInfo?.DepartureDate }</h4>
          <h4>ETA:<br/>{ shippingInfo?.ArrivalDate }</h4> 
        <h2 className='span3'>Milestones</h2>
        </div>
        <div className="milestone">
          <span className={ dateClass(departureTime) }>
            <img src={ tick } alt="tick" />
            <span className="line" />
          </span>
          <div>
            <h3>{ departureDate }</h3>
            <p> { isPast(departureTime) ? 
                    `Departed ${ shippingInfo?.Pol }, ${ shippingInfo?.FromCountry }` : 
                    `Set to depart ${ shippingInfo?.Pol }, ${ shippingInfo?.FromCountry }`
                }
            </p>
          </div>
        </div>
        {
          shippingInfo?.TSPorts.map((milestone, index) => {
            const aDate = milestone?.ArrivalDate;
            const aTime = dateConversion(aDate)
            // const aMonth = aTime?.toLocaleString('default', { month: 'long' });
            // const aDay = aTime?.toLocaleString('default', { day: 'numeric' });
            const dDate = milestone?.DepartureDate;
            const dTime = dateConversion(dDate);
            // const dMonth = dTime?.toLocaleString('default', { month: 'long' });
            // const dDay = dTime?.toLocaleString('default', { day: 'numeric' });

            return (
              <div key={ index }>
                <div className="milestone">
                  <span className={ dateClass(aTime) }>
                    <img src={tick} alt="tick" />
                    <span className="line" />
                  </span>
                  
                  <div>
                    <h3>{ aDate }</h3>
                    <p>{isPast(aTime) ? `Arrived at: ${ milestone.Port }` : `Set to Arrive at: ${ milestone.Port }`}</p>
                  </div>
                </div>
                <div className="milestone">
                  <span className={ dateClass(dTime) }>
                    <img src={tick} alt="tick" />
                    <span className="line" />
                  </span>
                  <div>
                    <h3>{ dDate }</h3>
                    <p>{isPast(dTime) ? `Departed: ${ milestone.Port }` : `Set to Depart: ${ milestone.Port }`}</p>
                  </div>
                </div>
              </div>
            )
          })
        }
        <div className="milestone">
          <span className={ dateClass(arrivalTime) }>
            <img src={ tick } alt="tick" />
          </span>
          <div>
            <h3>{ arrivalDate }</h3>
            <p> {isPast(arrivalTime) ? 
                  `Arrived at: ${ shippingInfo?.Pod }, ${ shippingInfo?.ToCountry }` : 
                  `Set to Arrive at: ${ shippingInfo?.Pod }, ${ shippingInfo?.ToCountry }`}</p>
          </div>
        </div>
      </div>
    )
  }
} 