import axios from 'axios'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './DeployedFunctionPanel.module.scss'
import Deployment from './components/Deployment/Deployment';
import RightPanel from '../../components/RightPanel/RightPanel';
import { LoaderSlider, LoaderSpinner } from '../../components/Loader';
import SlidingTabs from '../../components/SlidingTabs/SlidingTabs';
import Top from './components/Top/Top';
import Bottom from './components/Bottom/Bottom';
import useFunctionCall from '../../customHooks/useCallFunction';
import useInspect from '../../customHooks/useInspect';
import dataTypeMapping from '../../constants/dataTypeMapping';

function DeployedFunctionPanel() {
    const [funcs , setFuncs] = useState([]);
    const [isOpen , setIsOpen] = useState(false);
    const [selectedIndex , setSelectedIndex] = useState(null);
    const [selectedFunc, setSelectedFunc] = useState(null);
    const [title , setTitle] = useState('');
    const [funcUrl , setFuncUrl] = useState("");
    const {call ,data, isLoading , error } = useFunctionCall();
    const [method , setMethod]  = useState();
    const [output , setOutput] = useState('');
    const {inspect,data: deploymentData, isLoading:isDeploymentsLoading , deploymentsError } = useInspect()
    const [fields , setFields] = useState(null);
    const [outputErrorFlag , setOutputErrorFlag] = useState(false);
    const onClose = useCallback(()=>{
        setIsOpen(false);
        setSelectedIndex(null);
        setSelectedFunc(null);
    },[])

    const onClickFunction = useCallback((packageNo , funcNo)=>{
        setSelectedIndex([packageNo , funcNo]);
        setIsOpen(true);
    },[])
     
    useEffect(()=>{
        if(selectedIndex === null) return;

        const currentFunction = funcs[selectedIndex[0]].functions[selectedIndex[1]];
        setFields(currentFunction.params.
            map((param)=>[param.name , dataTypeMapping[param.type.id]??'string' , ""])) ;
        setTitle(currentFunction.name);
        setSelectedFunc(currentFunction);
        setMethod(currentFunction.params.length === 0 ? 'GET' : 'POST');
        if(currentFunction.lang === 'file')
            setFuncUrl(`https://api.metacall.io/${funcs[selectedIndex[0]].prefix}/${funcs[selectedIndex[0]].suffix}/v1/static/${currentFunction.name}`);
        else
        setFuncUrl(`https://api.metacall.io/${funcs[selectedIndex[0]].prefix}/${funcs[selectedIndex[0]].suffix}/v1/call/${currentFunction.name}`);
    },[selectedIndex ])


    useEffect(()=>{
        inspect(null , {
            onSuccess: (data) => {
                setFuncs(data);
            }
        });
    },[])

    function getNoDeployment(){
        return (
            <div className={styles.NoDeployment}>
                <div className={styles.NoDeploymentText}>
                    No Deployments Found
                </div>
                <div className={styles.suggestionsAI}>
                    <span className={styles.try}>Try</span> our intelligent deployment assistant to deploy your functions.
                </div>
                <div className={styles.workbench}>
                <span className={styles.try}>Try</span> our workbench.
                </div>
            </div>
        )
    }
    const onCall = useCallback(()=>{
        const data = {};
        fields.forEach((field)=>{
            data[field[0]] = field[2];
        })

        call({
            url: funcUrl,
            method,
            data
        }, {
            onSuccess: (data) => {
                data = JSON.stringify(data);
                setOutput(data.trim() ?? '<No Output>');
                setOutputErrorFlag(false)
            },
            onError: (error) => {
                if(selectedFunc.lang === 'file')
                    setOutput("Sorry! cannot open the file as it is hindered by cors policy")
                else
                    setOutput(error.message)
                setOutputErrorFlag(true)
            }
        });
    }, [funcUrl])

    function fieldManger(arr){
        setFields(arr);
    }
    return (
        <React.Fragment>
          <LoaderSpinner loading={isDeploymentsLoading} className={styles.LoaderSpinner}/>
          {
            !isDeploymentsLoading && funcs.length === 0 
            ? getNoDeployment()
            :!isDeploymentsLoading && <React.Fragment>
                <RightPanel isOpen={isOpen} title={title} onClose={onClose} loading={isLoading}>
                    {
                        <SlidingTabs 
                            Top = {<Top
                                funcName= { title}
                                funcUrl = {funcUrl}
                                method = {method}
                                onCall = {onCall}
                                fields = {fields}
                                setFields = {fieldManger}
                            />} 
                            Bottom = {<Bottom
                                        title={'Output'}
                                        content={output}
                                        isJson = {true}
                                        setContent = {setOutput}
                                        errorFlag = {outputErrorFlag}
                                        setErrorFlag = {setOutputErrorFlag}
                                        />}/>
                    
                    }
                </RightPanel>
                    <div className={styles.DeployedFunctionPanel}> 
                    {
                        funcs.map((funcData , packageNo)=>{
                            return (
                                <Deployment 
                                    key={packageNo}
                                    funcData={funcData}
                                    onClickFunction={(funcNo)=>onClickFunction(packageNo, funcNo)}
                                    />
                            )
                        })
                    }
                    </div>
            </React.Fragment>
        }
        </React.Fragment>
    )
}

export default DeployedFunctionPanel
