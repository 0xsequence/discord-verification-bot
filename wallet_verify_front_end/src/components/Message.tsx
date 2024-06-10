import React from 'react';
import WarnIcon from '@/components/WarnIcon';
import DoneIcon from '@/components/DoneIcon';
import {ResultMessage} from '@/interfaces/result-message';
import PropTypes from "prop-types";

Message.propTypes = {
    message: PropTypes.exact({
        Summary: PropTypes.string,
        Detail: PropTypes.string,
        IsSuccess: PropTypes.bool,
    }).isRequired
};

export default function Message({ message }: { message: ResultMessage }) {
    const IconComponent = message.IsSuccess ? DoneIcon : WarnIcon;
    return (
        <div className={`flex items-center py-1 bg-black border ${message.IsSuccess ? 'border-green' : 'border-red'}`}>
            <div className="mx-6">
                <IconComponent />
            </div>
            <div>
                <p className="text-white uppercase mb-2">{message.Summary}</p>
            </div>
        </div>
    );
}
