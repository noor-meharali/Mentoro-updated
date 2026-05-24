export const uploadService = {
  uploadCourseMedia: async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { url: URL.createObjectURL(file), name: file.name }
  },
}
