import React from 'react';
import PropTypes from 'prop-types';
import WarnIcon from '@/components/WarnIcon';
import DoneIcon from '@/components/DoneIcon';
import { ResultMessage } from '@/interfaces/result-message';

Message.propTypes = {
    message: PropTypes.exact({
        Summary: PropTypes.string,
        Detail: PropTypes.string,
        IsSuccess: PropTypes.bool,
    }).isRequired,
};

export default function Message(message: ResultMessage | undefined) {
    const IconComponent = message?.IsSuccess ? DoneIcon : WarnIcon;

    return message == null ? (
        <div></div>
    ) : (
        <div className={`flex items-center py-1 bg-black border ${message.IsSuccess ? 'border-green' : 'border-red'}`}>
            <div className="mx-6">
                <IconComponent />
            </div>
            <div>
                <p className="text-white uppercase mb-2">{message.Summary}</p>
                <p className="text-white uppercase">{message.Detail}</p>
            </div>
        </div>
    );
}
