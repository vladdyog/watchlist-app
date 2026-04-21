import React from 'react'
import { parseCSV, normalizeMovies } from '../utils'
import type { Movie } from '../types'

type Props = {
  onMoviesLoaded: (movies: Movie[]) => void
  onError: (error: string) => void
}

const CSVUpload: React.FC<Props> = ({ onMoviesLoaded, onError }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await parseCSV(file)

    if (!result.success) {
      onError(result.error)
      return
    }

    const movies = normalizeMovies(result.rows)

    if (movies.length === 0) {
      onError('No valid movies found in the CSV file.')
      return
    }

    onMoviesLoaded(movies)
  }

  return (
    <div>
      <label htmlFor="csv-upload">Upload your watchlist (CSV):</label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default CSVUpload