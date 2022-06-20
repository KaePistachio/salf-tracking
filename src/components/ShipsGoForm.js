// import { useState } from "react";
// import tick from '../images/tick.png'


// const ShipsGoForm = () => {
//   const [ shipping, setShipping ] = useState(null)
//   const [ isLoading, setIsLoading ] = useState(true); 
//   const [ hasSubmitted, setHasSubmitted ] = useState(false); 

//   // ? Utility for getting JSON from url
//   const fetchUrl = async (url) => {
//     const response = await fetch(url);
//     const json = await response.json();
//     return json;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(e.target.value);
//   }

//   return ( 
//     <>
//       <form
//         onSubmit={ handleSubmit }
//       >
//         <input type="text" id="tracking-id" value="Please Enter A Tracking ID" className="select" />
//         <button type="submit" value="Submit" >Track Shipment</button>
//       </form>
//       <div className="please-submit">
//         { !hasSubmitted ? 'Please submit the form' : <ShippingInfo shipping={shipping} isLoading={isLoading} /> }
//       </div>
//     </>
//   );
// }

// const ShippingInfo = ({ shipping, isLoading }) => {

//   if (isLoading) {
//     return 'Loading..'
//   }

//   const dateConversion = (date) => {
//     if (date !== undefined) {
//       const dateArray = date?.split('/');
//       const dateString = `${ dateArray[2] }-${ dateArray[1] }-${ dateArray[0] }`
//       const newDate = new Date(dateString);
//       return newDate
//     } else {
//       return;
//     }
//   }

//   const isPast = (date) => {
//     const now = Math.round(new Date().getTime()/1000);
//     if (now >= Math.round(date.getTime()/1000)) {
//       return true;
//     } else {
//       return false;
//     }
//   }

//   const dateSorter = () => {
//     // Get now
//     const now = Math.round(new Date().getTime()/1000);
//       // console.log(now);

//     // ? create array for dates
//     const dates = [];

//     // ? push initial arrival / departure dates from api res
//     dates.push(dateConversion(shipping?.ArrivalDate))
//     dates.push(dateConversion(shipping?.DepartureDate))

//     // ? map and push dates from within TSPorts
//     shipping?.TSPorts.map(date => {
//       dates.push(dateConversion(date.ArrivalDate));
//       dates.push(dateConversion(date.DepartureDate));
//       return dates;
//     })

//     // ? init array for past dates and map from previous array
//     const pastDates = [];
//     dates.map(date => {
//       if (now >= date.getTime()/1000) {
//           // console.log(date.getTime()/1000)
//         pastDates.push(date);
//       }
//       return pastDates;
//     });

//     // ? create array for time difference, and then filter pastDates array for the one that matches the time difference
//     const timeDifference = [];
    
//     pastDates.map(date => {
//       timeDifference.push(now - date.getTime() / 1000)
//       return timeDifference;
//     })
//       // console.log(timeDifference);
//     const activeEvent = pastDates.filter( 
//                           timestamp => (now - timestamp.getTime() / 1000) === Math.min(...timeDifference)
//                         );
//       // console.log(activeEvent[0])

//     // ? should now be a single value array so return the zero index
//     return activeEvent[0];
//   }

//   const dateClass = (date) => {
//     // ? runs datesorter function to determine if active event then if not determines whether past or present to asign class
//     const latestDate = dateSorter();

//     if (date.getTime() / 1000 === latestDate.getTime() / 1000) {
//       return "active-event";
//     } else if (isPast(date)) {
//       return "past-event";
//     } else {
//       return "future-event"
//     }
//   }

//   const departureDate = shipping?.DepartureDate;
//   const departureTime = dateConversion(departureDate);
//   // const departureMonth = departureTime?.toLocaleString('default', { month: 'long' });
//   // const departureDay = departureTime?.toLocaleString('default', { day: 'numeric' });
//   const arrivalDate = shipping?.ArrivalDate;
//   const arrivalTime = dateConversion(arrivalDate);
//   // const arrivalMonth = arrivalTime?.toLocaleString('default', { month: 'long' });
//   // const arrivalDay = arrivalTime?.toLocaleString('default', { day: 'numeric' });

//   return <div className="response-container">
//   <h1>Tracking Status</h1>
//   <div className='grid'> 
//     <h2 className='span3'>Shipment Information</h2>
//     <h4>Ref ID: <br/>{ shipping?.ReferenceNo }</h4>
//     <h4>Origin:<br/>{ shipping?.Pol }, { shipping?.FromCountry }</h4>
//     <h4>Destination:<br/>{ shipping?.Pod }, { shipping?.ToCountry }</h4>
//     <h4>Status:<br/>{ shipping?.SailingStatus }</h4>
//     <h4>Departure Date:<br/>{ shipping?.DepartureDate }</h4>
//     <h4>ETA:<br/>{ shipping?.ArrivalDate }</h4> 
//   <h2 className='span3'>Milestones</h2>
//   </div>
//   <div className="milestone">
//     <span className={ dateClass(departureTime) }>
//       <img src={ tick } alt="tick" />
//       <span className="line" />
//     </span>
//     <div>
//       <h3>{ departureDate }</h3>
//       <p> { isPast(departureTime) ? 
//               `Departed ${ shipping?.Pol }, ${ shipping?.FromCountry }` : 
//               `Set to depart ${ shipping?.Pol }, ${ shipping?.FromCountry }`
//           }
//       </p>
//     </div>
//   </div>
//   {
//     shipping?.TSPorts.map((milestone, index) => {
//       const aDate = milestone?.ArrivalDate;
//       const aTime = dateConversion(aDate)
//       // const aMonth = aTime?.toLocaleString('default', { month: 'long' });
//       // const aDay = aTime?.toLocaleString('default', { day: 'numeric' });
//       const dDate = milestone?.DepartureDate;
//       const dTime = dateConversion(dDate);
//       // const dMonth = dTime?.toLocaleString('default', { month: 'long' });
//       // const dDay = dTime?.toLocaleString('default', { day: 'numeric' });

//       return (
//         <div key={ index }>
//           <div className="milestone">
//             <span className={ dateClass(aTime) }>
//               <img src={tick} alt="tick" />
//               <span className="line" />
//             </span>
            
//             <div>
//               <h3>{ aDate }</h3>
//               <p>{isPast(aTime) ? `Arrived at: ${ milestone.Port }` : `Set to Arrive at: ${ milestone.Port }`}</p>
//             </div>
//           </div>
//           <div className="milestone">
//             <span className={ dateClass(dTime) }>
//               <img src={tick} alt="tick" />
//               <span className="line" />
//             </span>
//             <div>
//               <h3>{ dDate }</h3>
//               <p>{isPast(dTime) ? `Departed: ${ milestone.Port }` : `Set to Depart: ${ milestone.Port }`}</p>
//             </div>
//           </div>
//         </div>
//       )
//     })
//   }
//   <div className="milestone">
//     <span className={ dateClass(arrivalTime) }>
//       <img src={ tick } alt="tick" />
//     </span>
//     <div>
//       <h3>{ arrivalDate }</h3>
//       <p> {isPast(arrivalTime) ? 
//             `Arrived at: ${ shipping?.Pod }, ${ shipping?.ToCountry }` : 
//             `Set to Arrive at: ${ shipping?.Pod }, ${ shipping?.ToCountry }`}</p>
//     </div>
//   </div>
// </div>
// }

// export default ShipsGoForm;