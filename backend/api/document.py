from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from backend.db import DbSessionDep
from backend.tables import DocumentTable
import urllib.parse
from datetime import datetime
from typing import Optional

document_router = APIRouter(prefix="/documents", tags=["documents"])


@document_router.get("/", operation_id="get_all_documents")
def get_all_documents(db: DbSessionDep):
    """
    Get the full list of all documents (excluding binary content for performance).
    """
    documents = db.query(DocumentTable).all()

    result = []
    for doc in documents:
        doc_data = {
            "id": doc.doc_id,
            "name": doc.full_name,
            "code": doc.code_name,
            "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
            "valid_until": doc.valid_until_date.isoformat()
            if doc.valid_until_date
            else None,
            "filename": doc.filename,
            # Note: binary_content is excluded for performance reasons
            "file_size": len(doc.binary_content) if doc.binary_content else 0,
            "file_extension": doc.filename.split(".")[-1].lower()
            if "." in doc.filename
            else "",
            "status": "active",  # For now, assume all documents are active
        }
        result.append(doc_data)

    return result


@document_router.get("/{document_id}", operation_id="get_document_by_id")
def get_document_by_id(document_id: int, db: DbSessionDep):
    """
    Get information about a single document by its ID (excluding binary content for performance).
    """
    # Find the document by ID
    document = (
        db.query(DocumentTable).filter(DocumentTable.doc_id == document_id).first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Return the same format as get_all_documents but for a single document
    doc_data = {
        "id": document.doc_id,
        "name": document.full_name,
        "code": document.code_name,
        "issue_date": document.issue_date.isoformat() if document.issue_date else None,
        "valid_until": document.valid_until_date.isoformat()
        if document.valid_until_date
        else None,
        "filename": document.filename,
        # Note: binary_content is excluded for performance reasons
        "file_size": len(document.binary_content) if document.binary_content else 0,
        "file_extension": document.filename.split(".")[-1].lower()
        if "." in document.filename
        else "",
        "status": "active",  # For now, assume all documents are active
    }

    return doc_data


@document_router.post("/upload", operation_id="upload_document")
async def upload_document(
    db: DbSessionDep,
    file: UploadFile = File(...),
    name: str = Form(...),
    code: str = Form(...),
    issue_date: Optional[str] = Form(None),
    valid_until_date: Optional[str] = Form(None),
):
    """
    Upload a new document with metadata.
    """
    try:
        # Read file content
        file_content = await file.read()

        # Parse dates if provided
        parsed_issue_date = None
        parsed_valid_until_date = None

        if issue_date:
            try:
                parsed_issue_date = datetime.fromisoformat(
                    issue_date.replace("Z", "+00:00")
                ).date()
            except ValueError:
                try:
                    parsed_issue_date = datetime.strptime(issue_date, "%Y-%m-%d").date()
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid issue_date format. Use YYYY-MM-DD",
                    )

        if valid_until_date:
            try:
                parsed_valid_until_date = datetime.fromisoformat(
                    valid_until_date.replace("Z", "+00:00")
                ).date()
            except ValueError:
                try:
                    parsed_valid_until_date = datetime.strptime(
                        valid_until_date, "%Y-%m-%d"
                    ).date()
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid valid_until_date format. Use YYYY-MM-DD",
                    )

        # Create new document record
        new_document = DocumentTable(
            full_name=name,
            code_name=code,
            issue_date=parsed_issue_date,
            valid_until_date=parsed_valid_until_date,
            filename=file.filename or "unknown",
            binary_content=file_content,
        )

        # Add to database
        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        # Return the created document info
        doc_data = {
            "id": new_document.doc_id,
            "name": new_document.full_name,
            "code": new_document.code_name,
            "issue_date": new_document.issue_date.isoformat()
            if new_document.issue_date
            else None,
            "valid_until": new_document.valid_until_date.isoformat()
            if new_document.valid_until_date
            else None,
            "filename": new_document.filename,
            "file_size": len(new_document.binary_content)
            if new_document.binary_content
            else 0,
            "file_extension": new_document.filename.split(".")[-1].lower()
            if "." in new_document.filename
            else "",
            "status": "active",
        }

        return doc_data

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to upload document: {str(e)}"
        )


@document_router.delete("/{document_id}", operation_id="delete_document")
def delete_document(document_id: int, db: DbSessionDep):
    """
    Delete a document by its ID.
    """
    # Find the document by ID
    document = (
        db.query(DocumentTable).filter(DocumentTable.doc_id == document_id).first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        # Delete the document
        db.delete(document)
        db.commit()

        return {"message": "Document deleted successfully", "id": document_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to delete document: {str(e)}"
        )


@document_router.get("/{document_id}/download", operation_id="download_document")
def download_document(document_id: int, db: DbSessionDep):
    """
    Download a document by its ID.
    """
    # Find the document by ID
    document = (
        db.query(DocumentTable).filter(DocumentTable.doc_id == document_id).first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not document.binary_content:
        raise HTTPException(status_code=404, detail="Document content not found")

    # Determine the content type based on file extension
    file_extension = (
        document.filename.split(".")[-1].lower() if "." in document.filename else ""
    )
    content_type_mapping = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "txt": "text/plain",
        "rtf": "application/rtf",
        "zip": "application/zip",
        "rar": "application/x-rar-compressed",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "bmp": "image/bmp",
        "tiff": "image/tiff",
        "dwg": "application/acad",
        "dxf": "application/dxf",
    }

    content_type = content_type_mapping.get(file_extension, "application/octet-stream")

    # Properly encode the filename to handle Unicode characters
    # Use RFC 6266 encoding for non-ASCII filenames
    encoded_filename = urllib.parse.quote(document.filename, safe="")

    # Create a generator to stream the file content
    def iterfile():
        yield document.binary_content

    # Create the streaming response with appropriate headers
    response = StreamingResponse(
        iterfile(),
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Content-Length": str(len(document.binary_content)),
        },
    )

    return response
