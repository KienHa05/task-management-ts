import { Request, Response } from "express";

import Task from "../models/task.model";
import paginationHelper from "../../../helpers/pagination";
import searchHelper from "../../../helpers/search";

export const index = async (req: Request, res: Response) => {
    // Find
    interface Find {
        deleted: boolean,
        status?: string,
        title?: RegExp
    }

    const find: Find = {
        deleted: false,
    };

    if (req.query.status) {
        find.status = req.query.status.toString();
    }
    // End Find

    // Search
    let objectSearch = searchHelper(req.query);

    if (req.query.keyword) {
        find.title = objectSearch.regex;
    }
    // End Search

    // Pagination
    let initPagination = {
        currentPage: 1,
        limitItems: 2
    };

    const countTasks = await Task.countDocuments(find);

    let objectPagination = paginationHelper(
        initPagination,
        req.query,
        countTasks
    );
    // End Pagination

    // Sort
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        sort[sortKey] = req.query.sortValue;
    }
    // End Sort

    const tasks = await Task.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    res.json(tasks);
}

export const detail = async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const task = await Task.findOne({
        _id: id,
        deleted: false
    });

    res.json(task);
}

// [PATCH] /api/v1/tasks/change-status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const status: string = req.body.status;

        await Task.updateOne({ _id: id }, { status: status });

        res.json({
            code: 200,
            message: "Cập Nhật Trạng Thái Thành Công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Không Tồn Tại!"
        });
    }
};

// [PATCH] /api/v1/tasks/change-multi
export const changeMulti = async (req: Request, res: Response) => {
    try {
        const ids: string[] = req.body.ids;
        const key: string = req.body.key;
        const value: string = req.body.value;

        switch (key) {
            case "status":
                await Task.updateMany(
                    {
                        _id: { $in: ids },
                    },
                    {
                        status: value,
                    },
                );

                res.json({
                    code: 200,
                    message: "Cập Nhật Trạng Thái Thành Công!"
                });
                break;

            default:
                res.json({
                    code: 400,
                    message: "Không Tồn Tại!"
                });
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Không Tồn Tại!"
        });
    }
};

// [POST] /api/v1/tasks/create
export const create = async (req: Request, res: Response) => {
    try {
        const product = new Task(req.body);
        const data = await product.save();

        res.json({
            code: 200,
            message: "Tạo Thành Công!",
            data: data
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi!",
        });
    }
};

// [PATCH] /api/v1/tasks/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        await Task.updateOne({ _id: id }, req.body);

        res.json({
            code: 200,
            message: "Cập Nhật Thành Công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Có Lỗi!"
        });
    }
};

// [DELETE] /api/v1/tasks/delete/:id
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        await Task.updateOne(
            {
                _id: id
            },
            {
                deleted: true,
                deletedAt: new Date()
            }
        );

        res.json({
            code: 200,
            message: "Xóa Thành Công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Có Lỗi!"
        });
    }
};