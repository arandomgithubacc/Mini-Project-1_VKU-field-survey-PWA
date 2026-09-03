import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'

export interface SurveyData {
  id: string
  timestamp: number
  building: string
  floor: string
  room: string
  category: string
  rating: number
  notes: string
  photoBase64: string
  syncStatus: 'PENDING_SYNC' | 'SYNCED'
}

type SurveyDraft = Omit<SurveyData, 'id' | 'timestamp' | 'syncStatus'>

const surveyStore = localforage.createInstance({
  name: 'vku-field-survey',
  storeName: 'surveys',
})
const surveysKey = 'survey-records'

async function readSurveys(): Promise<SurveyData[]> {
  return (await surveyStore.getItem<SurveyData[]>(surveysKey)) ?? []
}

async function writeSurveys(surveys: SurveyData[]): Promise<void> {
  await surveyStore.setItem(surveysKey, surveys)
}

export async function saveSurveyDraft(draft: SurveyDraft): Promise<SurveyData> {
  const survey: SurveyData = {
    ...draft,
    id: uuidv4(),
    timestamp: Date.now(),
    syncStatus: 'PENDING_SYNC',
  }
  const surveys = await readSurveys()
  await writeSurveys([...surveys, survey])
  return survey
}

export async function getPendingSurveys(): Promise<SurveyData[]> {
  const surveys = await readSurveys()
  return surveys.filter((survey) => survey.syncStatus === 'PENDING_SYNC')
}

export async function getAllSurveys(): Promise<SurveyData[]> {
  return readSurveys()
}

export async function markAsSynced(id: string): Promise<SurveyData | undefined> {
  const surveys = await readSurveys()
  const survey = surveys.find((item) => item.id === id)

  if (!survey) {
    return undefined
  }

  const syncedSurvey: SurveyData = { ...survey, syncStatus: 'SYNCED' }
  await writeSurveys(
    surveys.map((item) => (item.id === id ? syncedSurvey : item)),
  )
  return syncedSurvey
}

async function sendSurveyToServer(survey: SurveyData): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 100))
  void survey
}

export async function syncPendingData(): Promise<SurveyData[]> {
  const pendingSurveys = await getPendingSurveys()
  const syncedSurveys: SurveyData[] = []

  for (const survey of pendingSurveys) {
    await sendSurveyToServer(survey)
    const syncedSurvey = await markAsSynced(survey.id)
    if (syncedSurvey) {
      syncedSurveys.push(syncedSurvey)
    }
  }

  return syncedSurveys
}
