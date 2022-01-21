import React, { useState } from "react";
import IpfsStorage from '@services/ipfs-service';
import useApi from "@x-hooks/use-api";
import { Button } from "react-bootstrap";
import { useTranslation } from "next-i18next";

interface IMakingSeo{
  currentPage: number,
  totalPages: number,
  makedBountys: number,
  totalBountys: number,
  currentBounty: string,
  lastBounty: string
}

export default function MakeBountySeo() {
  const [isLoading, setIsLoading] = useState(false);
  const [makingSeo, setMakingSeo] = useState<IMakingSeo>({
    currentPage: 0,
    totalPages: 0,
    makedBountys: 0,
    totalBountys: 0,
    currentBounty: '',
    lastBounty: ''
  } as IMakingSeo);
  const {getSeoCard, updateIssue, getIssues} = useApi()
  const { t } = useTranslation(['common', 'parity'])
  
  function delay(ms = 1000)  {
    return new Promise( resolve => { setTimeout(resolve, ms); });
  }

  async function createSeo(){
    setIsLoading(true)

    const client = new IpfsStorage()

    setMakingSeo((oldState)=>({
      makedBountys: 0,
      currentPage: 0,
      totalPages: 0,
      totalBountys: 0,
      currentBounty: '',
      lastBounty: ''
    }))

    var maxPage = 2;
    for (let i = 1; i < maxPage; i++) {
      const issues = await getIssues(`${i}`)
      maxPage = Math.ceil(issues.count/10)
      setMakingSeo((oldState)=>({
        ...oldState, 
        currentPage: i,
        totalPages: maxPage,
        totalBountys: issues.count,
      }))
      await Promise.all(issues?.rows?.map(async(issue)=>{
        const card = await getSeoCard(issue.issueId, true)
        const {path} = await client.add({data: card})
        if(path){
          updateIssue(issue.issueId,{
            seoImage: `${client.baseUrl}/${path}`
          })
          setMakingSeo((oldState)=>({
            ...oldState,
            lastBounty: oldState?.currentBounty,
            makedBountys: oldState?.makedBountys + 1 || 1,
            currentBounty: issue.issueId,
          }))
        }
      }))

      //Need this, because infura has limit of 10 request per second in add end point
      await delay()
    }

    setIsLoading(false)
  }

  return (
    <div>
      <div className="row">
        <div className="col text-center">
          <span className="d-block mb-2">{t("parity:create-bountys-seo")}</span>
        </div>
      </div>
      <div className="row text-center">
        <span>
          {t(`parity:fields.make-seo.current`, {
            bounty: makingSeo.currentBounty,
          })}
        </span>
        <span>
          {t(`parity:fields.make-seo.last`, {
            bounty: makingSeo.lastBounty,
          })}
        </span>
        <span>
          {t(`parity:fields.make-seo.bountys`, {
            current: makingSeo.makedBountys,
            total: makingSeo.totalBountys,
          })}
        </span>
        <span>
          {t(`parity:fields.make-seo.pages`, {
            current: makingSeo.currentPage,
            total: makingSeo.totalPages,
          })}
        </span>
      </div>
      <div className="row text-center mt-2">
        {isLoading && (
          <span className="text-danger text-uppercase">
            {t("parity:warning-bountys-seo")}
          </span>
        )}
        {!isLoading && !!makingSeo.makedBountys && (
          <span className="text-success text-uppercase">
            {t("parity:finished-bountys-seo")}
          </span>
        )}
      </div>
      <div className="row mt-3">
        <Button disabled={isLoading} onClick={createSeo}>
          {t("parity:make-seo")}
        </Button>
      </div>
    </div>
  );
}
