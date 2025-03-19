import { Storage } from '@google-cloud/storage'
import Env from './Env'

export default class GoogleStorage {
  /**
   * Get the Storage object for Google Cloud Storage
   * @returns The Storage object for Google Cloud Storage
   */
  public static getStorage() {
    return new Storage({
      projectId: Env.getParam('GCP_PROJECT_ID', 'YOUR_PROJECT_ID', false),
      keyFilename: Env.getParam(
        'GCP_KEY_FILE',
        'path/to/your/service-account.json',
        false,
      ),
    })
  }

  /**
   * Get the name of the bucket to use for Google Cloud Storage
   * @returns The name of the bucket to use for Google Cloud Storage
   */
  public static getBucketName() {
    return Env.getParam('GCS_BUCKET_NAME', 'your-gcs-bucket-name', false)
  }
}
