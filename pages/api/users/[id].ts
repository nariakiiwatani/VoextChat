import { NextApiRequest, NextApiResponse } from 'next'
import { ServerContext } from "../../../libs/Models"
import { firstOf, findByProps, findOneByProps } from "../../../libs/Utils"


type NextApiRequestWithContext = NextApiRequest & {
	context: ServerContext
}

const error = ({ status, message }) => (res: NextApiResponse) => {
	res.statusCode = status
	res.json({ error: message })
}

const createUser = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	return error({ status: 400, message: "you cannot use /api/users/[:id] to create a user. use /api/users instead." })
}
const readUser = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	const { context } = req
	const id = firstOf(req.query.id)
	const user = findOneByProps(context.users, { id })
	console.log(context.users)
	if (!user) {
		return error({ status: 400, message: `userId:${id} not exists` })(res)
	}
	const params = (firstOf(req.query.params) || "").split(",").filter(v => v !== "")
	params.forEach(p => {
		user[p] = findByProps(req.context[p], { user: user.id })
	})

	res.statusCode = 200
	res.json({ result: "ok", data: user })
}
const updateUser = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	error({ status: 501, message: "update user is not implemented yet" })(res)
}
const deleteUser = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	error({ status: 501, message: "delete user is not implemented yet" })(res)
}

const UserAPI = (req: NextApiRequestWithContext, res: NextApiResponse) => {
	switch (req.method) {
		case "GET":
			readUser(req)(res)
			break;
		case "POST":
			createUser(req)(res)
			break;
		case "UPDATE":
			updateUser(req)(res)
			break;
		case "DELETE":
			deleteUser(req)(res)
			break;
	}
}
export default UserAPI