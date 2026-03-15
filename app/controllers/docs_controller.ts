import { getOpenApiDocument, getSwaggerUiHtml } from '#services/openapi_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class DocsController {
  index({ response }: HttpContext) {
    response.header('content-type', 'text/html; charset=utf-8')
    return response.send(getSwaggerUiHtml())
  }

  openapi({ response }: HttpContext) {
    return response.ok(getOpenApiDocument())
  }
}
