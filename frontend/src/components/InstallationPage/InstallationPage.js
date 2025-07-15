import React, { useMemo } from 'react'

import Scheduler from '../Scheduler/Scheduler'
import InstallationList from './InstallationList'
import { useAuth } from '../../hooks/useAuth'

export default function InstallationPage() {
    const { isAdmin } = useAuth()
  
    return (
      <>
        {isAdmin ? <Scheduler /> : <></>}
        <InstallationList />
      </>
    )
  }