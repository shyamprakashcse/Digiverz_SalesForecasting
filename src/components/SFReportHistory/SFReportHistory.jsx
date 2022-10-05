import React, { useState,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from "react-router-dom"
import { Toast } from 'primereact/toast'; 
import { Messages } from 'primereact/messages';
import styles from "./SFReportHistory.module.css"
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

function SFReportHistory() { 
  
    const navigate = useNavigate()
    const config = {
        headers: {
          'content-type': 'multipart/form-data',
          
        },
      };
    const toast = useRef(null)
    const msgs1 = useRef(null);  
    const token = localStorage.getItem("token") 
    let [username,setUsername] = useState("")   
    let copyright = new Date().getFullYear() 


    let [SFHistory,SetSFHistory] = useState([])
    let history = [] 

    let [ReportVisible,SetReportVisible] = useState(false)
    let [SelectedSFReport,SetSelectedSFReport] = useState({})

    

    React.useEffect(() => { 


        const  tokenAuth = ()=>{
        axios.defaults.baseURL = 'http://localhost:5000';
        axios.defaults.headers.post['Content-Type'] ='multipart/form-data'
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        axios.defaults.headers.common = {'Authorization': `bearer ${token}`} 
        axios.post("http://localhost:5000/Authorization",{}).then((response) => {
          console.log(response.data); 
          setUsername(response.data["username"])
          console.log(username)
          if(response.data.Code === "404"){
            toast.current.show({severity: 'error', summary: 'Authentication Error', detail: 'UnAuthorized User'});
            msgs1.current.show({severity: 'error', summary: 'Authentication Error',detail: 'UnAuthorized User'});  
  
            setInterval(()=>{
              navigate("/login");
            },100); 
  
         
          }
          else{
            let SFHistoryFormData = new FormData()
            SFHistoryFormData.append("username",username)
        
            axios.post("http://localhost:5000/getsfreport",SFHistoryFormData,config).then((resp)=>{
                    console.log(resp.data) 
                    let tempsfhistory = resp.data["reports"]
                    let d = {}
                    let report = {}
                    history = [] 
                    tempsfhistory.forEach(element => {
                        d = {}
                        d["uniqueid"] = element["uniqueid"]
                        d["processedon"] = element["processedon"]
                        report = JSON.parse(element["report"]) 
                        d["model"] = report["brain"]
                        d["sd"] = report["startdate"]
                        d["ed"] = report["enddate"]
                        d["sfimg"] = report["sfimg"]
                        history.push(d)
                        SetSFHistory(history) 
                        

                    }); 

                    
                    
                    
                   
                    toast.current.show({severity: 'info', summary: 'Reports Found', detail: 'Sales Forecast Data Found'});
                    msgs1.current.show({severity: 'success', summary: 'Sales Forecasting Data Found',detail: 'Report fetched successfully'}); 
    
                }).catch((err)=>{
                   
                    console.log(err)
                    toast.current.show({severity: 'error', summary: 'error while fetching Sales forcast report data', detail: 'Data Not Found'});
                    msgs1.current.show({severity: 'error', summary: 'error while fetching Sales forcast report data',detail: 'Error Occurs'}); 
    
                })
            
          }
         
        }).catch((err)=>{
          console.log(err); 
          toast.current.show({severity: 'error', summary: 'Error while Authentication', detail: 'Error while Authentication Process'});
          msgs1.current.show({severity: 'error', summary: 'Error while Authentication',detail: 'Error while Authentication'});  
          
          navigate("/login")
         
        })
      };
      
      tokenAuth();
      },[token,navigate,username]);  

    
    // Sales Forecasting Report Getter 

    function getSalesForecastingReport(item){
      console.log(item)
      SetSelectedSFReport(item)
      SetReportVisible(true)
      
    }
    
   // Downloading PDF 

   function ExportPDF(){
    var print = document.getElementById('print');
    //var width = document.getElementById('print').offsetWidth; 
    document.getElementById("downloadbtn").style.visibility = "hidden";
    
    html2canvas(print).then(canvas => {
      var imgWidth = 208;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      var position = 5;
      pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth-7, imgHeight)
      pdf.save('Digitech_Past_SalesForecast_Analysis.pdf');
     }) 
     document.getElementById("downloadbtn").style.visibility = "visible";
     
  } 

  // HomeNavigator 
  
  function HomeNavigator(){
    navigate("/dashboard")
  }
        

  return (
    <div className={`${styles.sfrep}`}> 
        <Toast ref={toast}></Toast>
        <Messages ref={msgs1} /> 
        <div className={`${styles.sfrepdiv} card-header`}>
          <h3 className={`${styles.sfrephead} text-center card-header `}>Past Sales Forecasting History Results.</h3>
          <button className='btn btn-dark' onClick={HomeNavigator}>Back to Home</button>
        </div>

        <div className={`${styles.sfreptab}`}>
            <table className={`table table-bordered table-striped  table-hover table-responsive`}>
                <thead className={`bg-warning ${styles.tabhead}  text-capitalize border-solid text-md-center border-dark`}>
                  <tr>
                    <th className={``}>Serial No</th> 
                    <th className={``}>Processed ID</th>
                    <th className={``}>Processed On</th> 
                    <th className={``}>Model Name</th>
                    <th className={``}>Start Date</th>
                    <th className={``}>End Date</th>
                  </tr>
                </thead>

                <tbody className={`border-solid border-dark fw-bold`}>
                   { SFHistory.length>0 ?
                     SFHistory.map((item,ind)=>{
                        return(
                            <tr className={`bg-light card-header`} key={ind} onClick={()=>{getSalesForecastingReport(SFHistory[ind])}}>
                              <td className={`${styles.tabrow} `}>{ind+1}</td>
                              <td className={`${styles.tabrow}`}>{item["uniqueid"]}</td>
                              <td className={`${styles.tabrow}`}>{item["processedon"].slice(0,2)+"/"+item["processedon"].slice(2,4)+"/"+item["processedon"].slice(4,8)+" "+item["processedon"].slice(8,10)+":"+item["processedon"].slice(10,12)+":" + item["processedon"].slice(12,14)}</td>
                              <td className={`${styles.tabrow}`}>{item["model"]}</td>
                              <td className={`${styles.tabrow}`}>{item["sd"].slice(0,10)}</td>
                              <td className={`${styles.tabrow}`}>{item["ed"].slice(0,10)}</td>
                            </tr>
                           )
                     }) : <h5 className='card-header bg-danger m-2'>No Past Analysis Data Found. Please Save Your Analysis. </h5>
                   }

                   {
                     SFHistory.length === 0 ? <h6 className='card-header bg-danger m-2'>No Past History Found.To show here Save your results After forcasting</h6> : null 
                   }
                </tbody>
            </table> 
       </div> 

       {
         ReportVisible === true ? 
          <div className={`${styles.sfreportviewer} card-header`}> 
            <div className={`${styles.sfreportviewernav}`}>
              <button className='btn btn-dark' id="downloadbtn" onClick={ExportPDF}>Download Report</button>
            </div>
               <div className={`${styles.sfreportviewdiv} card-header`} id="print">
                  <h3 className={`${styles.sfrepviewhead} card-footer`}>{"Processed ID : "+SelectedSFReport["uniqueid"]}</h3>
                  <h3 className={`${styles.sfrepviewhead} card-footer`}>{"Processed ON : "+SelectedSFReport["processedon"].slice(0,2)+"/"+SelectedSFReport["processedon"].slice(2,4)+"/"+SelectedSFReport["processedon"].slice(4,8)+" "+SelectedSFReport["processedon"].slice(8,10)+":"+SelectedSFReport["processedon"].slice(10,12)+":" + SelectedSFReport["processedon"].slice(12,14)}</h3>
                  <h3 className={`${styles.sfrepviewhead} card-footer`}>{"Runned Model : "+SelectedSFReport["model"]}</h3>
                  <h3 className={`${styles.sfrepviewhead} card-footer`}>{"Forecasting Range: "+SelectedSFReport["sd"].slice(0,10)+" <--> "+SelectedSFReport["ed"].slice(0,10)}</h3>
                  <div className={`${styles.sfrepimg} card-header`}>
                       <img src={`data:image/png;base64,${SelectedSFReport["sfimg"]}`} alt='forecast' className={``}></img>
                  </div>
                  <div>
                    <h3 className={`${styles.copyright} text-center card-footer`} id="copyright">Digiverz KAAR Techologies Pvt Limited CopyRight @ {" " +copyright}</h3>
                 </div>
               </div>

              
          </div> : null 

        } 

       
    </div>
  )
}

export default SFReportHistory