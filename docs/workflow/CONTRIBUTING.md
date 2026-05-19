# CONTRIBUTING

Tài liệu ngắn về cách đóng góp vào repository.

Branch naming:
- `feat/<_issue_number_>-short-desc`
- `fix/<_issue_number_>-short-desc`
- `chore/<desc>`

Commit messages:
- Sử dụng Conventional Commits: `type(scope): subject`
- Ví dụ: `feat(auth): add OTP login`

PR:
- Tiêu đề: `#<issue>: Short summary` (nếu có issue)
- Body: link issue, mô tả, checklist
- Merge: ưu tiên `Squash and merge` để giữ changelog sạch. Mỗi commit được merge vào main sẽ gom lại thành 1 commit duy nhất với message PR.

Review:
- Ít nhất 1 approve từ team owner hoặc CODEOWNERS
- CI phải xanh trước khi merge

Issue:
- Sử dụng templates trong docs/template/
    + `bug_report.md` cho lỗi
    + `task.md` cho task hoặc feature mới
    + `pr_template.md` cho PR
- Gán label và estimate khi tạo
