import { Request, Response } from 'express'
import {
  createChart,
  deleteChart,
  modifyChart,
} from '../../../server/src/controllers/DashboardController'
import Chart, { ChartDataType, ChartType } from '../../src/models/Dashboard'

jest.mock('../../src/models/Dashboard')

describe('ChartController Unit Tests', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    statusMock = jest.fn(() => ({ json: jsonMock })) as any

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  describe('createChart', () => {
    it('should return 400 if required fields are missing', async () => {
      req = { body: {} }

      await createChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining('Missing required field(s)'),
      })
    })

    it('should create and save chart with custom date range', async () => {
      const saveMock = jest.fn().mockResolvedValue({})
      ;(Chart as jest.Mocked<any>).mockImplementation(() => ({ save: saveMock }))

      const start = new Date()
      start.setDate(start.getDate() - 5)
      const end = new Date()

      req = {
        body: {
          userId: 'user123',
          name: 'My Chart',
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      }

      await createChart(req as Request, res as Response)

      expect(saveMock).toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Chart saved successfully.',
      })
    })

    it('should return 400 for invalid enum values', async () => {
      req = {
        body: {
          userId: 'user123',
          name: 'Invalid Chart',
          type: 'InvalidType',
          dataType: 'InvalidDataType',
        },
      }

      await createChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining('Invalid chart type'),
      })
    })

    it('should return 400 if startDate >= endDate', async () => {
      req = {
        body: {
          userId: 'user123',
          name: 'Invalid Date',
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: '2025-04-01T00:00:00Z',
          endDate: '2025-03-01T00:00:00Z',
        },
      }

      await createChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Start date must be before end date.',
      })
    })

    it('should return 500 if save throws error', async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error('DB failure'))
      ;(Chart as jest.Mocked<any>).mockImplementation(() => ({ save: saveMock }))

      req = {
        body: {
          userId: 'user123',
          name: 'Crash',
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
        },
      }

      await createChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error. Please try again later.',
      })
    })
  })

  describe('modifyChart', () => {
    beforeEach(() => {
      req = {
        params: { chartId: 'chart123' },
        body: {
          name: 'Updated Chart',
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: '2024-03-01T00:00:00Z',
          endDate: '2024-03-04T00:00:00Z',
        },
      }
    })

    it('should modify and return chart', async () => {
      const mockChart = { _id: 'chart123', name: 'Updated Chart' }

      ;(Chart.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockChart)

      await modifyChart(req as Request, res as Response)

      expect(Chart.findByIdAndUpdate).toHaveBeenCalledWith(
        'chart123',
        req!.body,
        { new: true }
      )

      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Chart updated successfully.',
        chart: mockChart,
      })
    })

    it('should return 400 if fields are missing', async () => {
      req!.body = { type: ChartType.Pie, dataType: ChartDataType.IncidentType }

      await modifyChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Missing required field(s): name',
      })
    })

    it('should return 400 for invalid date range', async () => {
      req!.body.startDate = '2025-04-01T00:00:00Z'
      req!.body.endDate = '2025-03-01T00:00:00Z'

      await modifyChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Start date must be before end date.',
      })
    })

    it('should return 404 if chart not found', async () => {
      ;(Chart.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)

      await modifyChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Chart not found.',
      })
    })

    it('should return 500 if DB throws error', async () => {
      ;(Chart.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error('Mongo crash')
      )

      await modifyChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error. Please try again later.',
      })
    })
  })

  describe('deleteChart', () => {
    it('should delete the chart and return success', async () => {
      const mockChart = { _id: 'chart123', name: 'Old Chart' }
      ;(Chart.findByIdAndDelete as jest.Mock).mockResolvedValue(mockChart)

      req = { params: { chartId: 'chart123' } }

      await deleteChart(req as Request, res as Response)

      expect(Chart.findByIdAndDelete).toHaveBeenCalledWith('chart123')
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Chart deleted successfully.',
      })
    })

    it('should return 404 if chart is not found', async () => {
      ;(Chart.findByIdAndDelete as jest.Mock).mockResolvedValue(null)

      req = { params: { chartId: 'not-found' } }

      await deleteChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Chart not found.',
      })
    })

    it('should return 500 if delete fails', async () => {
      ;(Chart.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('DB crash'))

      req = { params: { chartId: 'crash-id' } }

      await deleteChart(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error. Please try again later.',
      })
    })
  })
})
